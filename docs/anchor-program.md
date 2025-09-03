# SolVote Anchor Program Documentation

This document provides comprehensive documentation for the SolVote Anchor program, which powers the on-chain voting functionality of the SolVote platform.

## Overview

The SolVote Anchor program is a Solana smart contract written in Rust using the Anchor framework. It provides the core functionality for creating and managing on-chain voting proposals, casting votes, and tallying results.

## Program ID

The program is deployed with the following ID:
```
Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

Note: This is a placeholder ID. The actual program ID will be generated when you deploy the program.

## Account Structures

### VotingInstance

The `VotingInstance` account is the main account that stores global state for a voting instance.

```rust
#[account]
pub struct VotingInstance {
    pub authority: Pubkey,
    pub proposal_count: u64,
    pub bump: u8,
}
```

- `authority`: The public key of the authority who initialized the voting instance
- `proposal_count`: The total number of proposals created in this voting instance
- `bump`: The bump seed used to derive the PDA for this account

### Proposal

The `Proposal` account stores information about a specific proposal.

```rust
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
```

- `proposal_id`: Unique identifier for the proposal
- `proposer`: Public key of the account that created the proposal
- `title`: Title of the proposal (max 100 characters)
- `description`: Description of the proposal (max 1000 characters)
- `creation_timestamp`: Unix timestamp when the proposal was created
- `end_timestamp`: Unix timestamp when the proposal voting period ends
- `yes_votes`: Number of "Yes" votes
- `no_votes`: Number of "No" votes
- `is_active`: Whether the proposal is active or closed
- `voted`: Map of public keys to vote types, tracking who has voted and how

## Instructions

### Initialize

Initializes a new voting instance.

```rust
pub fn initialize(ctx: Context<Initialize>, bump: u8) -> Result<()>
```

Parameters:
- `bump`: The bump seed for the voting instance PDA

Accounts:
- `voting_instance`: The voting instance account to initialize (PDA)
- `authority`: The authority who is initializing the voting instance (signer)
- `system_program`: The Solana system program

### Create Proposal

Creates a new proposal.

```rust
pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,
    description: String,
    end_timestamp: i64,
) -> Result<()>
```

Parameters:
- `title`: Title of the proposal (max 100 characters)
- `description`: Description of the proposal (max 1000 characters)
- `end_timestamp`: Unix timestamp when the proposal voting period ends

Accounts:
- `voting_instance`: The voting instance account (PDA)
- `proposal`: The proposal account to create (PDA)
- `proposer`: The account creating the proposal (signer)
- `system_program`: The Solana system program

### Vote

Casts a vote on a proposal.

```rust
pub fn vote(ctx: Context<Vote>, vote_type: VoteType) -> Result<()>
```

Parameters:
- `vote_type`: The type of vote (Yes or No)

Accounts:
- `proposal`: The proposal account to vote on
- `voter`: The account casting the vote (signer)
- `system_program`: The Solana system program

### Close Proposal

Closes a proposal after voting has ended.

```rust
pub fn close_proposal(ctx: Context<CloseProposal>) -> Result<()>
```

Accounts:
- `proposal`: The proposal account to close
- `authority`: The authority closing the proposal (signer)
- `system_program`: The Solana system program

## Events

### ProposalCreatedEvent

Emitted when a new proposal is created.

```rust
#[event]
pub struct ProposalCreatedEvent {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub end_timestamp: i64,
}
```

### VoteCastEvent

Emitted when a vote is cast.

```rust
#[event]
pub struct VoteCastEvent {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub vote_type: VoteType,
}
```

### ProposalClosedEvent

Emitted when a proposal is closed.

```rust
#[event]
pub struct ProposalClosedEvent {
    pub proposal_id: u64,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub result: ProposalResult,
}
```

## Error Codes

The program defines the following error codes:

```rust
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
```

## PDAs (Program Derived Addresses)

The program uses the following PDAs:

### Voting Instance PDA

```
[b"voting-instance"]
```

### Proposal PDA

```
[b"proposal", proposal_id.to_le_bytes()]
```

## Security Considerations

1. **Access Control**: Only the authority can initialize the voting instance. Anyone can create proposals and vote, but each account can only vote once per proposal.

2. **Input Validation**: The program validates inputs such as title and description length, and ensures that proposal end times are in the future.

3. **Timestamp Validation**: The program checks that proposals can only be closed after their end time has passed.

4. **Double Voting Prevention**: The program tracks which accounts have voted on each proposal to prevent double voting.

## Usage Examples

### Initialize a Voting Instance

```typescript
const [votingInstancePda, votingInstanceBump] = await PublicKey.findProgramAddressSync(
  [Buffer.from("voting-instance")],
  programId
);

await program.methods
  .initialize(votingInstanceBump)
  .accounts({
    votingInstance: votingInstancePda,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Create a Proposal

```typescript
const [proposalPda, proposalBump] = await PublicKey.findProgramAddressSync(
  [Buffer.from("proposal"), new BN(proposalId).toArrayLike(Buffer, "le", 8)],
  programId
);

await program.methods
  .createProposal(
    "Proposal Title",
    "Proposal Description",
    new BN(Math.floor(Date.now() / 1000) + 86400) // 1 day from now
  )
  .accounts({
    votingInstance: votingInstancePda,
    proposal: proposalPda,
    proposer: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Vote on a Proposal

```typescript
await program.methods
  .vote({ yes: {} }) // or { no: {} }
  .accounts({
    proposal: proposalPda,
    voter: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Close a Proposal

```typescript
await program.methods
  .closeProposal()
  .accounts({
    proposal: proposalPda,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## Conclusion

The SolVote Anchor program provides a secure and flexible foundation for on-chain voting on the Solana blockchain. By following this documentation, developers can integrate with the program to create and manage voting proposals, cast votes, and tally results.

