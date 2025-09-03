import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Solvote } from "../target/types/solvote";
import { expect } from "chai";

describe("solvote", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solvote as Program<Solvote>;
  const authority = provider.wallet;
  
  // Generate a new keypair for a voter
  const voter = anchor.web3.Keypair.generate();
  
  // Find PDA for voting instance
  const [votingInstancePda, votingInstanceBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("voting-instance")],
    program.programId
  );
  
  // Variables to store proposal data
  let proposalId: number;
  let proposalPda: anchor.web3.PublicKey;
  
  it("Initializes the voting instance", async () => {
    // Airdrop SOL to the voter for transaction fees
    const airdropSignature = await provider.connection.requestAirdrop(
      voter.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);
    
    // Initialize the voting instance
    const tx = await program.methods
      .initialize(votingInstanceBump)
      .accounts({
        votingInstance: votingInstancePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    // Fetch the voting instance account
    const votingInstance = await program.account.votingInstance.fetch(votingInstancePda);
    
    // Verify the voting instance was initialized correctly
    expect(votingInstance.authority.toString()).to.equal(authority.publicKey.toString());
    expect(votingInstance.proposalCount.toNumber()).to.equal(0);
    expect(votingInstance.bump).to.equal(votingInstanceBump);
  });
  
  it("Creates a proposal", async () => {
    // Proposal data
    const title = "Test Proposal";
    const description = "This is a test proposal for the SolVote program";
    const currentTime = Math.floor(Date.now() / 1000);
    const endTimestamp = currentTime + 86400; // 1 day from now
    
    // Find PDA for the proposal
    proposalId = 1; // First proposal
    const [proposalPdaAddress, proposalBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), new anchor.BN(proposalId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    proposalPda = proposalPdaAddress;
    
    // Create the proposal
    const tx = await program.methods
      .createProposal(title, description, new anchor.BN(endTimestamp))
      .accounts({
        votingInstance: votingInstancePda,
        proposal: proposalPda,
        proposer: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    // Fetch the proposal account
    const proposal = await program.account.proposal.fetch(proposalPda);
    
    // Verify the proposal was created correctly
    expect(proposal.proposalId.toNumber()).to.equal(proposalId);
    expect(proposal.proposer.toString()).to.equal(authority.publicKey.toString());
    expect(proposal.title).to.equal(title);
    expect(proposal.description).to.equal(description);
    expect(proposal.endTimestamp.toNumber()).to.equal(endTimestamp);
    expect(proposal.yesVotes.toNumber()).to.equal(0);
    expect(proposal.noVotes.toNumber()).to.equal(0);
    expect(proposal.isActive).to.be.true;
  });
  
  it("Casts a vote", async () => {
    // Cast a "Yes" vote
    const tx = await program.methods
      .vote({ yes: {} })
      .accounts({
        proposal: proposalPda,
        voter: voter.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([voter])
      .rpc();
    
    // Fetch the updated proposal
    const proposal = await program.account.proposal.fetch(proposalPda);
    
    // Verify the vote was recorded correctly
    expect(proposal.yesVotes.toNumber()).to.equal(1);
    expect(proposal.noVotes.toNumber()).to.equal(0);
    
    // Verify the voter was recorded
    const voterKey = voter.publicKey.toString();
    expect(proposal.voted.has(voterKey)).to.be.true;
  });
  
  it("Prevents double voting", async () => {
    try {
      // Try to vote again with the same voter
      await program.methods
        .vote({ no: {} })
        .accounts({
          proposal: proposalPda,
          voter: voter.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([voter])
        .rpc();
      
      // If we reach here, the test failed
      expect.fail("Expected an error but none was thrown");
    } catch (error) {
      // Verify the error is the expected one
      expect(error.message).to.include("AlreadyVoted");
    }
  });
  
  it("Closes a proposal", async () => {
    // We need to advance time to close the proposal
    // For testing, we'll modify the proposal end time directly
    // In a real scenario, we would wait for the end time to pass
    
    // Get the proposal account data
    const proposal = await program.account.proposal.fetch(proposalPda);
    
    // Set the end time to now - 1 second
    const currentTime = Math.floor(Date.now() / 1000);
    const newEndTime = currentTime - 1;
    
    // Update the proposal end time (this is just for testing)
    // In a real scenario, we would wait for the end time to pass
    await program.methods
      .closeProposal()
      .accounts({
        proposal: proposalPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    // Fetch the updated proposal
    const updatedProposal = await program.account.proposal.fetch(proposalPda);
    
    // Verify the proposal was closed
    expect(updatedProposal.isActive).to.be.false;
  });
});

