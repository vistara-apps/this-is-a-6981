import React from 'react'
import { Vote, Users, Clock, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { useProposals } from '../context/ProposalContext'
import { useWallet } from '../context/WalletContext'

const Dashboard = ({ setCurrentView }) => {
  const { proposals } = useProposals()
  const { isConnected } = useWallet()

  const stats = {
    totalProposals: proposals.length,
    activeProposals: proposals.filter(p => p.status === 'active').length,
    totalVotes: proposals.reduce((sum, p) => sum + p.yesVotes + p.noVotes, 0),
    participation: proposals.length > 0 ? Math.round((proposals.reduce((sum, p) => sum + p.yesVotes + p.noVotes, 0) / (proposals.length * 100)) * 100) : 0
  }

  const recentProposals = proposals.slice(0, 3)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Launch Verifiable On-Chain Voting DApps
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Deploy secure, verifiable voting dApps on Solana in minutes. Create proposals, gather votes, and build governance systems that matter.
        </p>
        
        {!isConnected && (
          <div className="mt-6">
            <p className="text-accent font-medium mb-4">Connect your wallet to get started</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Proposals</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalProposals}</p>
            </div>
            <Vote className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Active</p>
              <p className="text-2xl font-bold text-text-primary">{stats.activeProposals}</p>
            </div>
            <Clock className="w-8 h-8 text-accent" />
          </div>
        </div>
        
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Votes</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalVotes}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Participation</p>
              <p className="text-2xl font-bold text-text-primary">{stats.participation}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h3 className="text-xl font-semibold text-text-primary">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('create')}
              className="w-full btn-primary px-4 py-3 rounded-lg flex items-center justify-between text-white"
              disabled={!isConnected}
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5" />
                <span>Create New Proposal</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentView('proposals')}
              className="w-full btn-secondary px-4 py-3 rounded-lg flex items-center justify-between text-text-primary"
            >
              <div className="flex items-center space-x-3">
                <Vote className="w-5 h-5" />
                <span>View All Proposals</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6 space-y-4">
          <h3 className="text-xl font-semibold text-text-primary">Recent Proposals</h3>
          <div className="space-y-3">
            {recentProposals.length > 0 ? (
              recentProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary text-sm">{proposal.title}</p>
                    <p className="text-text-secondary text-xs">
                      {proposal.yesVotes + proposal.noVotes} votes
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    proposal.status === 'active' 
                      ? 'bg-green-400/20 text-green-400' 
                      : 'bg-gray-400/20 text-gray-400'
                  }`}>
                    {proposal.status}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-secondary text-sm">No proposals yet. Create your first one!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard