import React, { useState, useEffect } from 'react';
import { Clock, Vote, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useProposals } from '../context/ProposalContext';
import { useWallet } from '../context/WalletContext';
import ProposalCard from './ProposalCard';
import VoteModal from './VoteModal';
import Button from './Button';

const ProposalList = () => {
  const { proposals, loading, error, fetchProposals, closeProposal } = useProposals();
  const { isConnected } = useWallet();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closingId, setClosingId] = useState(null);

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    return proposal.status === filter;
  });

  const statusCounts = {
    all: proposals.length,
    active: proposals.filter(p => p.status === 'active').length,
    closed: proposals.filter(p => p.status === 'closed').length
  };

  // Handle voting
  const handleVote = (proposal, voteType) => {
    setSelectedProposal(proposal);
    setIsVoteModalOpen(true);
  };

  // Handle closing a proposal
  const handleCloseProposal = async (proposalId) => {
    if (!isConnected) return;
    
    setIsClosing(true);
    setClosingId(proposalId);
    
    try {
      const result = await closeProposal(proposalId);
      if (result.success) {
        // Proposal closed successfully
      } else {
        console.error('Failed to close proposal:', result.error);
      }
    } catch (err) {
      console.error('Error closing proposal:', err);
    } finally {
      setIsClosing(false);
      setClosingId(null);
    }
  };

  // Refresh proposals
  const handleRefresh = () => {
    fetchProposals();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Proposals</h1>
          <p className="text-text-secondary">Vote on active proposals and view results</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleRefresh}
            loading={loading}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          
          {/* Filter Tabs */}
          <div className="flex bg-surface/50 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'active', label: 'Active', count: statusCounts.active },
              { key: 'closed', label: 'Closed', count: statusCounts.closed }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
          <Button 
            variant="link" 
            className="ml-2 text-red-400 underline" 
            onClick={handleRefresh}
          >
            Try again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && proposals.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Loading proposals...
          </h3>
          <p className="text-text-secondary">
            Please wait while we fetch the latest proposals.
          </p>
        </div>
      )}

      {/* Proposals Grid */}
      {!loading && filteredProposals.length > 0 ? (
        <div className="grid gap-6">
          {filteredProposals.map((proposal, index) => (
            <div key={proposal.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <ProposalCard 
                proposal={proposal} 
                onVote={handleVote}
                onClose={isConnected && proposal.status === 'active' ? handleCloseProposal : null}
              />
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-12">
          <Vote className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No {filter !== 'all' ? filter : ''} proposals found
          </h3>
          <p className="text-text-secondary">
            {filter === 'all' 
              ? "Be the first to create a proposal!" 
              : `No ${filter} proposals at the moment.`
            }
          </p>
        </div>
      )}

      {/* Vote Modal */}
      {selectedProposal && (
        <VoteModal
          proposal={selectedProposal}
          isOpen={isVoteModalOpen}
          onClose={() => {
            setIsVoteModalOpen(false);
            setSelectedProposal(null);
          }}
        />
      )}
    </div>
  );
};

export default ProposalList;
