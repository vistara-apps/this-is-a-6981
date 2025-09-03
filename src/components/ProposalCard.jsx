import React from 'react'
import { Clock, Users, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import VoteButton from './VoteButton'

const ProposalCard = ({ proposal, onVote }) => {
  const { isConnected, publicKey } = useWallet()
  
  const totalVotes = proposal.yesVotes + proposal.noVotes
  const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0
  const noPercentage = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0
  
  const hasVoted = proposal.voters && proposal.voters.includes(publicKey)
  const canVote = isConnected && proposal.status === 'active' && !hasVoted

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card p-6 space-y-4 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-text-primary">{proposal.title}</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              proposal.status === 'active' 
                ? 'bg-green-400/20 text-green-400' 
                : 'bg-gray-400/20 text-gray-400'
            }`}>
              {proposal.status}
            </div>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">{proposal.description}</p>
        </div>
        
        {canVote && (
          <div className="flex gap-2 flex-shrink-0">
            <VoteButton variant="yes" onClick={() => onVote('yes')} />
            <VoteButton variant="no" onClick={() => onVote('no')} />
          </div>
        )}
      </div>

      {/* Vote Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Vote Results</span>
          <span className="text-text-secondary">{totalVotes} total votes</span>
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
            <span className="text-sm font-medium text-text-primary w-12 text-right">
              {proposal.yesVotes}
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
            <span className="text-sm font-medium text-text-primary w-12 text-right">
              {proposal.noVotes}
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
          {proposal.status === 'active' && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Ends {formatDate(proposal.endTime)}</span>
            </div>
          )}
        </div>
        
        {hasVoted && (
          <div className="text-sm text-accent font-medium">
            ✓ You voted
          </div>
        )}
        
        {!isConnected && proposal.status === 'active' && (
          <div className="text-sm text-text-secondary">
            Connect wallet to vote
          </div>
        )}
      </div>
    </div>
  )
}

export default ProposalCard