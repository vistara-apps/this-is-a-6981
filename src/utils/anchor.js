/**
 * Anchor Utilities for SolVote
 * 
 * This module provides utilities for interacting with the SolVote Anchor program.
 */

import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { Buffer } from 'buffer';

// Program ID (replace with your deployed program ID)
export const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// Get the Solana connection
export const getConnection = () => {
  const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
  const rpcUrl = import.meta.env.VITE_RPC_URL || 
    (network === 'mainnet-beta' 
      ? 'https://api.mainnet-beta.solana.com' 
      : network === 'devnet' 
        ? 'https://api.devnet.solana.com' 
        : 'http://localhost:8899');
  
  return new Connection(rpcUrl, 'confirmed');
};

// Get the Anchor provider
export const getProvider = (wallet) => {
  const connection = getConnection();
  
  // Create a custom provider with the wallet
  const provider = new AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: 'confirmed' }
  );
  
  return provider;
};

// Get the Anchor program
export const getProgram = (wallet) => {
  const provider = getProvider(wallet);
  
  // Load the IDL (in a real implementation, this would be loaded from a file or fetched from the chain)
  // For this demo, we'll use a placeholder
  const idl = {
    version: '0.1.0',
    name: 'solvote',
    instructions: [
      {
        name: 'initialize',
        accounts: [
          { name: 'votingInstance', isMut: true, isSigner: false },
          { name: 'authority', isMut: true, isSigner: true },
          { name: 'systemProgram', isMut: false, isSigner: false }
        ],
        args: [{ name: 'bump', type: 'u8' }]
      },
      {
        name: 'createProposal',
        accounts: [
          { name: 'votingInstance', isMut: true, isSigner: false },
          { name: 'proposal', isMut: true, isSigner: false },
          { name: 'proposer', isMut: true, isSigner: true },
          { name: 'systemProgram', isMut: false, isSigner: false }
        ],
        args: [
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'endTimestamp', type: 'i64' }
        ]
      },
      {
        name: 'vote',
        accounts: [
          { name: 'proposal', isMut: true, isSigner: false },
          { name: 'voter', isMut: true, isSigner: true },
          { name: 'systemProgram', isMut: false, isSigner: false }
        ],
        args: [{ name: 'voteType', type: { defined: 'VoteType' } }]
      },
      {
        name: 'closeProposal',
        accounts: [
          { name: 'proposal', isMut: true, isSigner: false },
          { name: 'authority', isMut: true, isSigner: true },
          { name: 'systemProgram', isMut: false, isSigner: false }
        ],
        args: []
      }
    ],
    accounts: [
      {
        name: 'VotingInstance',
        type: {
          kind: 'struct',
          fields: [
            { name: 'authority', type: 'publicKey' },
            { name: 'proposalCount', type: 'u64' },
            { name: 'bump', type: 'u8' }
          ]
        }
      },
      {
        name: 'Proposal',
        type: {
          kind: 'struct',
          fields: [
            { name: 'proposalId', type: 'u64' },
            { name: 'proposer', type: 'publicKey' },
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'creationTimestamp', type: 'i64' },
            { name: 'endTimestamp', type: 'i64' },
            { name: 'yesVotes', type: 'u64' },
            { name: 'noVotes', type: 'u64' },
            { name: 'isActive', type: 'bool' },
            { name: 'voted', type: { map: ['publicKey', { defined: 'VoteType' }] } }
          ]
        }
      }
    ],
    types: [
      {
        name: 'VoteType',
        type: {
          kind: 'enum',
          variants: [
            { name: 'Yes' },
            { name: 'No' }
          ]
        }
      },
      {
        name: 'ProposalResult',
        type: {
          kind: 'enum',
          variants: [
            { name: 'Passed' },
            { name: 'Rejected' },
            { name: 'Tie' }
          ]
        }
      }
    ],
    events: [
      {
        name: 'ProposalCreatedEvent',
        fields: [
          { name: 'proposalId', type: 'u64', index: false },
          { name: 'proposer', type: 'publicKey', index: false },
          { name: 'title', type: 'string', index: false },
          { name: 'endTimestamp', type: 'i64', index: false }
        ]
      },
      {
        name: 'VoteCastEvent',
        fields: [
          { name: 'proposalId', type: 'u64', index: false },
          { name: 'voter', type: 'publicKey', index: false },
          { name: 'voteType', type: { defined: 'VoteType' }, index: false }
        ]
      },
      {
        name: 'ProposalClosedEvent',
        fields: [
          { name: 'proposalId', type: 'u64', index: false },
          { name: 'yesVotes', type: 'u64', index: false },
          { name: 'noVotes', type: 'u64', index: false },
          { name: 'result', type: { defined: 'ProposalResult' }, index: false }
        ]
      }
    ],
    errors: [
      { code: 6000, name: 'TitleTooLong', msg: 'Title is too long (max 100 characters)' },
      { code: 6001, name: 'DescriptionTooLong', msg: 'Description is too long (max 1000 characters)' },
      { code: 6002, name: 'InvalidEndTime', msg: 'End time must be in the future' },
      { code: 6003, name: 'ProposalInactive', msg: 'Proposal is no longer active' },
      { code: 6004, name: 'ProposalEnded', msg: 'Proposal has already ended' },
      { code: 6005, name: 'ProposalStillActive', msg: 'Proposal is still active' },
      { code: 6006, name: 'AlreadyVoted', msg: 'You have already voted on this proposal' }
    ]
  };
  
  // Create the program
  return new Program(idl, PROGRAM_ID, provider);
};

// Find the voting instance PDA
export const findVotingInstancePDA = async () => {
  const [pda, bump] = await PublicKey.findProgramAddressSync(
    [Buffer.from('voting-instance')],
    PROGRAM_ID
  );
  
  return { pda, bump };
};

// Find a proposal PDA
export const findProposalPDA = async (proposalId) => {
  const { pda: votingInstancePda } = await findVotingInstancePDA();
  
  const [pda, bump] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('proposal'),
      new BN(proposalId).toArrayLike(Buffer, 'le', 8)
    ],
    PROGRAM_ID
  );
  
  return { pda, bump };
};

// Initialize a voting instance
export const initializeVotingInstance = async (wallet) => {
  try {
    const program = getProgram(wallet);
    const { pda, bump } = await findVotingInstancePDA();
    
    // Check if the voting instance already exists
    try {
      const votingInstance = await program.account.votingInstance.fetch(pda);
      return { success: true, votingInstance };
    } catch (error) {
      // Voting instance doesn't exist, create it
      const tx = await program.methods
        .initialize(bump)
        .accounts({
          votingInstance: pda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      // Fetch the newly created voting instance
      const votingInstance = await program.account.votingInstance.fetch(pda);
      
      return { success: true, votingInstance, tx };
    }
  } catch (error) {
    console.error('Error initializing voting instance:', error);
    return { success: false, error: error.message };
  }
};

// Create a proposal
export const createProposal = async (wallet, title, description, endTimestamp) => {
  try {
    const program = getProgram(wallet);
    const { pda: votingInstancePda } = await findVotingInstancePDA();
    
    // Fetch the voting instance to get the proposal count
    const votingInstance = await program.account.votingInstance.fetch(votingInstancePda);
    const proposalId = votingInstance.proposalCount.toNumber();
    
    // Find the proposal PDA
    const { pda: proposalPda } = await findProposalPDA(proposalId);
    
    // Create the proposal
    const tx = await program.methods
      .createProposal(
        title,
        description,
        new BN(endTimestamp)
      )
      .accounts({
        votingInstance: votingInstancePda,
        proposal: proposalPda,
        proposer: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();
    
    // Fetch the newly created proposal
    const proposal = await program.account.proposal.fetch(proposalPda);
    
    return { success: true, proposal, tx };
  } catch (error) {
    console.error('Error creating proposal:', error);
    return { success: false, error: error.message };
  }
};

// Vote on a proposal
export const voteOnProposal = async (wallet, proposalId, voteType) => {
  try {
    const program = getProgram(wallet);
    const { pda: proposalPda } = await findProposalPDA(proposalId);
    
    // Vote on the proposal
    const tx = await program.methods
      .vote({ [voteType]: {} })
      .accounts({
        proposal: proposalPda,
        voter: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();
    
    // Fetch the updated proposal
    const proposal = await program.account.proposal.fetch(proposalPda);
    
    return { success: true, proposal, tx };
  } catch (error) {
    console.error('Error voting on proposal:', error);
    return { success: false, error: error.message };
  }
};

// Close a proposal
export const closeProposal = async (wallet, proposalId) => {
  try {
    const program = getProgram(wallet);
    const { pda: proposalPda } = await findProposalPDA(proposalId);
    
    // Close the proposal
    const tx = await program.methods
      .closeProposal()
      .accounts({
        proposal: proposalPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();
    
    // Fetch the updated proposal
    const proposal = await program.account.proposal.fetch(proposalPda);
    
    return { success: true, proposal, tx };
  } catch (error) {
    console.error('Error closing proposal:', error);
    return { success: false, error: error.message };
  }
};

// Get all proposals
export const getAllProposals = async (wallet) => {
  try {
    const program = getProgram(wallet);
    const { pda: votingInstancePda } = await findVotingInstancePDA();
    
    // Fetch the voting instance to get the proposal count
    const votingInstance = await program.account.votingInstance.fetch(votingInstancePda);
    const proposalCount = votingInstance.proposalCount.toNumber();
    
    // Fetch all proposals
    const proposals = [];
    for (let i = 0; i < proposalCount; i++) {
      const { pda } = await findProposalPDA(i);
      try {
        const proposal = await program.account.proposal.fetch(pda);
        proposals.push({
          ...proposal,
          id: i,
          pda
        });
      } catch (error) {
        console.warn(`Error fetching proposal ${i}:`, error);
      }
    }
    
    return { success: true, proposals };
  } catch (error) {
    console.error('Error getting all proposals:', error);
    return { success: false, error: error.message };
  }
};

// Check if a user has voted on a proposal
export const hasVoted = async (wallet, proposalId) => {
  try {
    const program = getProgram(wallet);
    const { pda: proposalPda } = await findProposalPDA(proposalId);
    
    // Fetch the proposal
    const proposal = await program.account.proposal.fetch(proposalPda);
    
    // Check if the user has voted
    const hasVoted = proposal.voted.has(wallet.publicKey.toString());
    
    return { success: true, hasVoted };
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getConnection,
  getProvider,
  getProgram,
  findVotingInstancePDA,
  findProposalPDA,
  initializeVotingInstance,
  createProposal,
  voteOnProposal,
  closeProposal,
  getAllProposals,
  hasVoted
};

