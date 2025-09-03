import React, { useState } from 'react'
import { X, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'
import { useProposals } from '../context/ProposalContext'
import { useWallet } from '../context/WalletContext'

const VoteModal = ({ proposal, onClose }) => {
  const [selectedVote, setSelectedVote] = useState(null)
  const [isVoting, setIsVoting] = useState(false)
  const { vote } = useProposals()
  const { publicKey } = useWallet()

  const handleVote = async () => {
    if (!selectedVote) return
    
    setIsVoting(true)
    
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await vote(proposal.id, selectedVote, publicKey)
    setIsVoting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full p-6 space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text-primary">Cast Your Vote</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

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
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                selectedVote === 'yes'
                  ? 'border-green-400 bg-green-400/20 text-green-400'
                  : 'border-surface/50 hover:border-green-400/50 text-text-secondary hover:text-green-400'
              }`}
            >
              <ThumbsUp className="w-6 h-6" />
              <span className="font-medium">Yes</span>
            </button>
            
            <button
              onClick={() => setSelectedVote('no')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                selectedVote === 'no'
                  ? 'border-red-400 bg-red-400/20 text-red-400'
                  : 'border-surface/50 hover:border-red-400/50 text-text-secondary hover:text-red-400'
              }`}
            >
              <ThumbsDown className="w-6 h-6" />
              <span className="font-medium">No</span>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-primary font-medium">Blockchain Transaction</p>
            <p className="text-text-secondary">This vote will be recorded on-chain and cannot be changed.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary px-4 py-3 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleVote}
            disabled={!selectedVote || isVoting}
            className="flex-1 btn-primary px-4 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVoting ? 'Voting...' : 'Confirm Vote'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VoteModal