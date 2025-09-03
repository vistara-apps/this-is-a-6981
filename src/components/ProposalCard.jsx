import React from 'react';
import { Clock, Calendar, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useProposals } from '../context/ProposalContext';
import VoteButton from './VoteButton';
import Button from './Button';

const ProposalCard = ({ proposal, onVote, onClose }) => {
  const { isConnected, publicKey } = useWallet();
  const { formatDate, hasVoted: checkHasVoted } = useProposals();
  
  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;
  
  const hasVoted = checkHasVoted ? checkHasVoted(proposal.id) : 
    (proposal.voters && proposal.voters.some(voter => 
      typeof voter === 'string' ? voter === publicKey : voter.publicKey === publicKey
    ));
    
  const canVote = isConnected && proposal.status === 'active' && !hasVoted;
  const isActive = proposal.status === 'active';

  // Format the proposer address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="card p-6 space-y-4 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-text-primary">{proposal.title}</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-400/20 text-green-400' 
                : 'bg-gray-400/20 text-gray-400'
            }`}>
              {isActive ? 'Active' : 'Closed'}
            </div>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">{proposal.description}</p>
          
          <div className="mt-2 flex items-center text-xs text-text-secondary">
            <User className="w-3 h-3 mr-1" />
            <span>Proposed by {formatAddress(proposal.proposer)}</span>
          </div>
        </div>
        
        {canVote && (
          <div className="flex gap-2 flex-shrink-0">
            <VoteButton 
              variant="yes" 
              onClick={() => onVote(proposal, 'yes')} 
              count={proposal.yesVotes}
            />
            <VoteButton 
              variant="no" 
              onClick={() => onVote(proposal, 'no')} 
              count={proposal.noVotes}
            />
          </div>
        )}
        
        {!canVote && isActive && (
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onVote(proposal)}
            >
              View Details
            </Button>
          </div>
        )}
        
        {!isActive && onClose && (
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onClose(proposal.id)}
            >
              Close Proposal
            </Button>
          </div>
        )}
      </div>

      {/* Vote Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Vote Results</span>
          <span className="text-text-secondary">{totalVotes.toLocaleString()} total votes</span>
        </div>
        
        <div className="space-y-2">
          {/* Yes Votes */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-16">
              <ThumbsUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Yes</span>
            </div>
            <div className="flex-1 bg-surface/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full transition-all duration-500"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text-primary w-16 text-right">
              {proposal.yesVotes.toLocaleString()} 
              <span className="text-text-secondary text-xs ml-1">
                ({yesPercentage.toFixed(1)}%)
              </span>
            </span>
          </div>
          
          {/* No Votes */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-16">
              <ThumbsDown className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">No</span>
            </div>
            <div className="flex-1 bg-surface/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-red-400 rounded-full transition-all duration-500"
                style={{ width: `${noPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text-primary w-16 text-right">
              {proposal.noVotes.toLocaleString()}
              <span className="text-text-secondary text-xs ml-1">
                ({noPercentage.toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t border-surface/50">
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(proposal.createdAt)}</span>
          </div>
          {isActive ? (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Ends {formatDate(proposal.endTime)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Ended {formatDate(proposal.endTime)}</span>
            </div>
          )}
        </div>
        
        {hasVoted && (
          <div className="text-sm text-accent font-medium">
            ✓ You voted
          </div>
        )}
        
        {!isConnected && isActive && (
          <div className="text-sm text-text-secondary">
            Connect wallet to vote
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;
