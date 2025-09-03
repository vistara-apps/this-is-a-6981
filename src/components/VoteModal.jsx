import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle, Loader2 } from 'lucide-react';
import { useProposals } from '../context/ProposalContext';
import { useWallet } from '../context/WalletContext';
import Modal from './Modal';
import Button from './Button';

const VoteModal = ({ proposal, isOpen, onClose }) => {
  const [selectedVote, setSelectedVote] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState(null);
  const { vote } = useProposals();
  const { isConnected } = useWallet();

  const handleVote = async () => {
    if (!selectedVote) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      const result = await vote(proposal.id, selectedVote);
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to cast vote. Please try again.');
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const modalFooter = (
    <>
      <Button 
        variant="secondary" 
        onClick={onClose}
        disabled={isVoting}
      >
        Cancel
      </Button>
      <Button 
        variant="primary" 
        onClick={handleVote}
        disabled={!selectedVote || isVoting}
        loading={isVoting}
      >
        {isVoting ? 'Voting...' : 'Confirm Vote'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cast Your Vote"
      footer={modalFooter}
    >
      <div className="space-y-6">
        {/* Proposal Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-text-primary">{proposal.title}</h4>
          <p className="text-sm text-text-secondary line-clamp-3">{proposal.description}</p>
        </div>

        {/* Vote Options */}
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">Choose your vote:</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedVote('yes')}
              disabled={isVoting}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                selectedVote === 'yes'
                  ? 'border-green-400 bg-green-400/20 text-green-400'
                  : 'border-surface/50 hover:border-green-400/50 text-text-secondary hover:text-green-400'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsUp className="w-6 h-6" />
              <span className="font-medium">Yes</span>
            </button>
            
            <button
              onClick={() => setSelectedVote('no')}
              disabled={isVoting}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                selectedVote === 'no'
                  ? 'border-red-400 bg-red-400/20 text-red-400'
                  : 'border-surface/50 hover:border-red-400/50 text-text-secondary hover:text-red-400'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsDown className="w-6 h-6" />
              <span className="font-medium">No</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Wallet connection warning */}
        {!isConnected && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm">
            You need to connect your wallet to vote on-chain.
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-primary font-medium">Blockchain Transaction</p>
            <p className="text-text-secondary">This vote will be recorded on-chain and cannot be changed.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VoteModal;
