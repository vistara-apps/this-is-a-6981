import React from 'react'
import { Vote, Plus, BarChart3 } from 'lucide-react'
import WalletConnector from './WalletConnector'

const Header = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'proposals', label: 'Proposals', icon: Vote },
    { id: 'create', label: 'Create', icon: Plus },
  ]

  return (
    <header className="border-b border-surface/50 bg-surface/30 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">SolVote</h1>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentView === id
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <WalletConnector />
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex space-x-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 flex-1 ${
                currentView === id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header