import React, { createContext, useContext, useState } from 'react'

const ProposalContext = createContext()

export const useProposals = () => {
  const context = useContext(ProposalContext)
  if (!context) {
    throw new Error('useProposals must be used within a ProposalProvider')
  }
  return context
}

export const ProposalProvider = ({ children }) => {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: "Upgrade Treasury Management Protocol",
      description: "Proposal to implement a new multi-signature treasury management system to improve fund security and enable better governance of community assets. This upgrade would include automatic vesting schedules, spending limits, and transparent reporting mechanisms.",
      proposer: "A7X8kMockProposer1",
      createdAt: Date.now() - 86400000 * 2, // 2 days ago
      endTime: Date.now() + 86400000 * 5, // 5 days from now
      status: "active",
      yesVotes: 1247,
      noVotes: 341,
      voters: []
    },
    {
      id: 2,
      title: "Community Grants Program Launch",
      description: "Establish a quarterly grants program to fund community-driven development projects. The program would allocate 2% of treasury funds to support builders, researchers, and educators contributing to the ecosystem.",
      proposer: "B9Y7nMockProposer2",
      createdAt: Date.now() - 86400000 * 5, // 5 days ago
      endTime: Date.now() + 86400000 * 2, // 2 days from now
      status: "active",
      yesVotes: 892,
      noVotes: 156,
      voters: []
    },
    {
      id: 3,
      title: "Update Voting Participation Requirements",
      description: "Modify the minimum token holding requirement for proposal creation from 1000 to 500 tokens to encourage broader community participation while maintaining quality governance standards.",
      proposer: "C8Z6mMockProposer3",
      createdAt: Date.now() - 86400000 * 10, // 10 days ago
      endTime: Date.now() - 86400000 * 3, // ended 3 days ago
      status: "closed",
      yesVotes: 2341,
      noVotes: 987,
      voters: []
    }
  ])

  const createProposal = async (proposalData) => {
    const newProposal = {
      id: proposals.length + 1,
      ...proposalData,
      createdAt: Date.now(),
      status: "active",
      yesVotes: 0,
      noVotes: 0,
      voters: []
    }
    
    setProposals(prev => [newProposal, ...prev])
  }

  const vote = async (proposalId, voteType, voterPublicKey) => {
    setProposals(prev => prev.map(proposal => {
      if (proposal.id === proposalId) {
        const newVoters = [...(proposal.voters || []), voterPublicKey]
        return {
          ...proposal,
          [voteType === 'yes' ? 'yesVotes' : 'noVotes']: proposal[voteType === 'yes' ? 'yesVotes' : 'noVotes'] + 1,
          voters: newVoters
        }
      }
      return proposal
    }))
  }

  return (
    <ProposalContext.Provider value={{
      proposals,
      createProposal,
      vote
    }}>
      {children}
    </ProposalContext.Provider>
  )
}