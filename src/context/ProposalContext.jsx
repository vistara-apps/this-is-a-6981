import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { 
  getAllProposals, 
  createProposal as createProposalOnChain, 
  voteOnProposal, 
  closeProposal as closeProposalOnChain,
  initializeVotingInstance,
  hasVoted as checkHasVoted
} from '../utils/anchor';
import { format, formatDistance } from 'date-fns';
import { useSubscription } from './SubscriptionContext';

const ProposalContext = createContext();

export const useProposals = () => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error('useProposals must be used within a ProposalProvider');
  }
  return context;
};

export const ProposalProvider = ({ children }) => {
  const { isConnected, walletAdapter, publicKey } = useWallet();
  const { updateUsage, checkLimit } = useSubscription ? useSubscription() : { updateUsage: () => {}, checkLimit: () => true };
  
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Mock data for when not connected to a wallet
  const mockProposals = [
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
  ];

  // Initialize the voting instance if not already initialized
  const initialize = async () => {
    if (!isConnected || !walletAdapter) return;
    
    try {
      setLoading(true);
      const result = await initializeVotingInstance(walletAdapter);
      
      if (result.success) {
        setInitialized(true);
        console.log('Voting instance initialized:', result.tx);
      } else {
        // If it fails, it might be because it's already initialized
        setInitialized(true);
      }
    } catch (err) {
      console.error('Error initializing voting instance:', err);
      // If it fails with a specific error about the account already existing,
      // we can assume it's already initialized
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch proposals when wallet is connected
  const fetchProposals = async () => {
    if (!isConnected || !walletAdapter) {
      setProposals(mockProposals);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await getAllProposals(walletAdapter);
      
      if (result.success) {
        // Transform the proposals to match our expected format
        const transformedProposals = result.proposals.map(p => ({
          id: p.proposalId.toNumber(),
          title: p.title,
          description: p.description,
          proposer: p.proposer.toString(),
          createdAt: p.creationTimestamp.toNumber() * 1000, // Convert to milliseconds
          endTime: p.endTimestamp.toNumber() * 1000, // Convert to milliseconds
          status: p.isActive ? 'active' : 'closed',
          yesVotes: p.yesVotes.toNumber(),
          noVotes: p.noVotes.toNumber(),
          voters: Array.from(p.voted.entries()).map(([key, value]) => ({
            publicKey: key.toString(),
            voteType: Object.keys(value)[0].toLowerCase()
          })),
          pda: p.pda
        }));
        
        setProposals(transformedProposals);
      } else {
        setError('Failed to fetch proposals');
        // Fall back to mock data if there's an error
        setProposals(mockProposals);
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Error fetching proposals: ' + err.message);
      // Fall back to mock data if there's an error
      setProposals(mockProposals);
    } finally {
      setLoading(false);
    }
  };

  // Set up auto-refresh for proposals
  useEffect(() => {
    if (isConnected && walletAdapter) {
      // Refresh proposals every 30 seconds
      const interval = setInterval(() => {
        fetchProposals();
      }, 30000);
      
      setRefreshInterval(interval);
      
      return () => clearInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [isConnected, walletAdapter]);

  // Fetch proposals when wallet connection changes
  useEffect(() => {
    if (isConnected && walletAdapter) {
      initialize().then(() => fetchProposals());
    } else {
      setProposals(mockProposals);
    }
  }, [isConnected, walletAdapter]);

  // Create a new proposal
  const createProposal = async (proposalData) => {
    if (!isConnected || !walletAdapter) {
      // If not connected, just use mock data
      const newProposal = {
        id: proposals.length + 1,
        ...proposalData,
        proposer: 'MockProposer',
        createdAt: Date.now(),
        status: "active",
        yesVotes: 0,
        noVotes: 0,
        voters: []
      };
      
      setProposals(prev => [newProposal, ...prev]);
      return { success: true, proposalId: newProposal.id };
    }
    
    // Check subscription limits
    if (!checkLimit('proposals')) {
      return { 
        success: false, 
        error: 'You have reached the maximum number of proposals allowed by your subscription plan. Please upgrade to create more proposals.' 
      };
    }
    
    try {
      setLoading(true);
      
      // Convert the end date to a Unix timestamp
      const endTimestamp = Math.floor(new Date(proposalData.endTime).getTime() / 1000);
      
      const result = await createProposalOnChain(
        walletAdapter,
        proposalData.title,
        proposalData.description,
        endTimestamp
      );
      
      if (result.success) {
        // Update usage statistics
        updateUsage('proposals');
        
        // Refresh the proposals list
        await fetchProposals();
        return { success: true, proposalId: result.proposal.proposalId.toNumber() };
      } else {
        setError('Failed to create proposal: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError('Error creating proposal: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Vote on a proposal
  const vote = async (proposalId, voteType) => {
    if (!isConnected || !walletAdapter) {
      // If not connected, just update the mock data
      setProposals(prev => prev.map(proposal => {
        if (proposal.id === proposalId) {
          const newVoters = [...(proposal.voters || []), { publicKey: 'MockVoter', voteType }];
          return {
            ...proposal,
            [voteType === 'yes' ? 'yesVotes' : 'noVotes']: proposal[voteType === 'yes' ? 'yesVotes' : 'noVotes'] + 1,
            voters: newVoters
          };
        }
        return proposal;
      }));
      return { success: true };
    }
    
    try {
      setLoading(true);
      
      const result = await voteOnProposal(walletAdapter, proposalId, voteType);
      
      if (result.success) {
        // Update usage statistics
        updateUsage('votes');
        
        // Refresh the proposals list
        await fetchProposals();
        return { success: true };
      } else {
        setError('Failed to vote on proposal: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error voting on proposal:', err);
      setError('Error voting on proposal: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Close a proposal
  const closeProposal = async (proposalId) => {
    if (!isConnected || !walletAdapter) {
      // If not connected, just update the mock data
      setProposals(prev => prev.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            status: 'closed'
          };
        }
        return proposal;
      }));
      return { success: true };
    }
    
    try {
      setLoading(true);
      
      const result = await closeProposalOnChain(walletAdapter, proposalId);
      
      if (result.success) {
        // Refresh the proposals list
        await fetchProposals();
        return { success: true };
      } else {
        setError('Failed to close proposal: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error closing proposal:', err);
      setError('Error closing proposal: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if a user has voted on a proposal
  const hasVoted = async (proposalId) => {
    if (!isConnected || !walletAdapter || !publicKey) return false;
    
    try {
      const result = await checkHasVoted(walletAdapter, proposalId);
      return result.success ? result.hasVoted : false;
    } catch (err) {
      console.error('Error checking if user has voted:', err);
      return false;
    }
  };

  // Format the date for display
  const formatDate = (timestamp) => {
    return format(new Date(timestamp), 'PPP p');
  };

  // Format the time remaining for display
  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    
    if (now > end) {
      return 'Ended';
    }
    
    return formatDistance(end, now, { addSuffix: true });
  };

  // Get proposal results
  const getProposalResults = (proposal) => {
    const { yesVotes, noVotes } = proposal;
    const totalVotes = yesVotes + noVotes;
    
    if (totalVotes === 0) {
      return { result: 'No votes yet', passed: false };
    }
    
    if (proposal.status === 'active') {
      return { result: 'In progress', passed: false };
    }
    
    if (yesVotes > noVotes) {
      return { result: 'Passed', passed: true };
    } else if (noVotes > yesVotes) {
      return { result: 'Rejected', passed: false };
    } else {
      return { result: 'Tie', passed: false };
    }
  };

  return (
    <ProposalContext.Provider value={{
      proposals,
      loading,
      error,
      createProposal,
      vote,
      closeProposal,
      hasVoted,
      formatDate,
      formatTimeRemaining,
      getProposalResults,
      fetchProposals,
      initialized
    }}>
      {children}
    </ProposalContext.Provider>
  );
};
