import React, { useState } from 'react'
import { Clock, Users, CheckCircle, XCircle } from 'lucide-react'
import { useProposals } from '../context/ProposalContext'
import ProposalCard from './ProposalCard'
import VoteModal from './VoteModal'

const ProposalList = () => {
  const { proposals } = useProposals()
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [filter, setFilter] = useState('all')

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true
    return proposal.status === filter
  })

  const statusCounts = {
    all: proposals.length,
    active: proposals.filter(p => p.status === 'active').length,
    closed: proposals.filter(p => p.status === 'closed').length
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Proposals</h1>
          <p className="text-text-secondary">Vote on active proposals and view results</p>
        </div>
        
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

      {/* Proposals Grid */}
      {filteredProposals.length > 0 ? (
        <div className="grid gap-6">
          {filteredProposals.map((proposal, index) => (
            <div key={proposal.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <ProposalCard 
                proposal={proposal} 
                onVote={() => setSelectedProposal(proposal)}
              />
            </div>
          ))}
        </div>
      ) : (
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
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </div>
  )
}

export default ProposalList