use anchor_lang::prelude::*;
use std::collections::BTreeMap;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solvote {
    use super::*;

    /// Initialize a new voting instance
    pub fn initialize(ctx: Context<Initialize>, bump: u8) -> Result<()> {
        let voting_instance = &mut ctx.accounts.voting_instance;
        voting_instance.authority = ctx.accounts.authority.key();
        voting_instance.proposal_count = 0;
        voting_instance.bump = bump;
        
        Ok(())
    }

    /// Create a new proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        end_timestamp: i64,
    ) -> Result<()> {
        // Validate inputs
        if title.len() > 100 {
            return Err(ErrorCode::TitleTooLong.into());
        }
        
        if description.len() > 1000 {
            return Err(ErrorCode::DescriptionTooLong.into());
        }
        
        let current_timestamp = Clock::get()?.unix_timestamp;
        if end_timestamp <= current_timestamp {
            return Err(ErrorCode::InvalidEndTime.into());
        }
        
        // Get the next proposal ID
        let voting_instance = &mut ctx.accounts.voting_instance;
        let proposal_id = voting_instance.proposal_count;
        voting_instance.proposal_count += 1;
        
        // Initialize the proposal
        let proposal = &mut ctx.accounts.proposal;
        proposal.proposal_id = proposal_id;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title.clone();
        proposal.description = description;
        proposal.creation_timestamp = current_timestamp;
        proposal.end_timestamp = end_timestamp;
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.is_active = true;
        proposal.voted = BTreeMap::new();
        
        // Emit event
        emit!(ProposalCreatedEvent {
            proposal_id,
            proposer: ctx.accounts.proposer.key(),
            title,
            end_timestamp,
        });
        
        Ok(())
    }

    /// Vote on a proposal
    pub fn vote(ctx: Context<Vote>, vote_type: VoteType) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter = ctx.accounts.voter.key();
        
        // Check if the proposal is active
        if !proposal.is_active {
            return Err(ErrorCode::ProposalInactive.into());
        }
        
        // Check if the proposal has ended
        let current_timestamp = Clock::get()?.unix_timestamp;
        if current_timestamp > proposal.end_timestamp {
            return Err(ErrorCode::ProposalEnded.into());
        }
        
        // Check if the voter has already voted
        if proposal.voted.contains_key(&voter) {
            return Err(ErrorCode::AlreadyVoted.into());
        }
        
        // Record the vote
        match vote_type {
            VoteType::Yes => {
                proposal.yes_votes += 1;
            },
            VoteType::No => {
                proposal.no_votes += 1;
            },
        }
        
        proposal.voted.insert(voter, vote_type.clone());
        
        // Emit event
        emit!(VoteCastEvent {
            proposal_id: proposal.proposal_id,
            voter,
            vote_type,
        });
        
        Ok(())
    }

    /// Close a proposal after voting has ended
    pub fn close_proposal(ctx: Context<CloseProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        
        // Check if the proposal is still active
        if !proposal.is_active {
            return Err(ErrorCode::ProposalInactive.into());
        }
        
        // Check if the proposal has ended
        let current_timestamp = Clock::get()?.unix_timestamp;
        if current_timestamp <= proposal.end_timestamp {
            return Err(ErrorCode::ProposalStillActive.into());
        }
        
        // Close the proposal
        proposal.is_active = false;
        
        // Determine the result
        let result = if proposal.yes_votes > proposal.no_votes {
            ProposalResult::Passed
        } else if proposal.yes_votes < proposal.no_votes {
            ProposalResult::Rejected
        } else {
            ProposalResult::Tie
        };
        
        // Emit event
        emit!(ProposalClosedEvent {
            proposal_id: proposal.proposal_id,
            yes_votes: proposal.yes_votes,
            no_votes: proposal.no_votes,
            result,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 1, // discriminator + pubkey + u64 + u8
        seeds = [b"voting-instance"],
        bump = bump,
    )]
    pub voting_instance: Account<'info, VotingInstance>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        mut,
        seeds = [b"voting-instance"],
        bump = voting_instance.bump,
    )]
    pub voting_instance: Account<'info, VotingInstance>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + 8 + 32 + 100 + 4 + 1000 + 8 + 8 + 8 + 8 + 1 + 1000, // discriminator + u64 + pubkey + title + description + 2*i64 + 2*u64 + bool + voted map
        seeds = [b"proposal", voting_instance.proposal_count.to_le_bytes().as_ref()],
        bump,
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct VotingInstance {
    pub authority: Pubkey,
    pub proposal_count: u64,
    pub bump: u8,
}

#[account]
pub struct Proposal {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub creation_timestamp: i64,
    pub end_timestamp: i64,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub is_active: bool,
    pub voted: BTreeMap<Pubkey, VoteType>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VoteType {
    Yes,
    No,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalResult {
    Passed,
    Rejected,
    Tie,
}

#[event]
pub struct ProposalCreatedEvent {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub end_timestamp: i64,
}

#[event]
pub struct VoteCastEvent {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub vote_type: VoteType,
}

#[event]
pub struct ProposalClosedEvent {
    pub proposal_id: u64,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub result: ProposalResult,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Title is too long (max 100 characters)")]
    TitleTooLong,
    
    #[msg("Description is too long (max 1000 characters)")]
    DescriptionTooLong,
    
    #[msg("End time must be in the future")]
    InvalidEndTime,
    
    #[msg("Proposal is no longer active")]
    ProposalInactive,
    
    #[msg("Proposal has already ended")]
    ProposalEnded,
    
    #[msg("Proposal is still active")]
    ProposalStillActive,
    
    #[msg("You have already voted on this proposal")]
    AlreadyVoted,
}

