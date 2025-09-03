import React, { useState } from 'react';
import { Vote, Plus, BarChart3, Server, CreditCard, Menu, X } from 'lucide-react';
import WalletConnector from './WalletConnector';
import { useWallet } from '../context/WalletContext';

const Header = ({ currentView, setCurrentView }) => {
  const { isConnected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'proposals', label: 'Proposals', icon: Vote },
    { id: 'create', label: 'Create', icon: Plus, requiresWallet: true },
    { id: 'deploy', label: 'Deploy', icon: Server, requiresWallet: true },
    { id: 'subscription', label: 'Plans', icon: CreditCard, requiresWallet: true },
  ];

  // Filter nav items based on wallet connection
  const filteredNavItems = navItems.filter(item => 
    !item.requiresWallet || (item.requiresWallet && isConnected)
  );

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="border-b border-surface/50 bg-surface/30 backdrop-blur-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">SolVote</h1>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              {filteredNavItems.map(({ id, label, icon: Icon }) => (
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
          
          <div className="flex items-center space-x-4">
            <WalletConnector />
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg bg-surface/50 text-text-secondary"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 flex flex-col space-y-2 bg-surface/80 p-4 rounded-lg animate-slide-down">
            {filteredNavItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setCurrentView(id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentView === id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
