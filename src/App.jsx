import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ProposalList from './components/ProposalList'
import CreateProposalForm from './components/CreateProposalForm'
import { WalletProvider } from './context/WalletContext'
import { ProposalProvider } from './context/ProposalContext'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <WalletProvider>
      <ProposalProvider>
        <div className="min-h-screen bg-gradient-to-br from-bg to-purple-900">
          <Header currentView={currentView} setCurrentView={setCurrentView} />
          
          <main className="container mx-auto px-4 py-8 max-w-6xl">
            {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
            {currentView === 'proposals' && <ProposalList />}
            {currentView === 'create' && <CreateProposalForm setCurrentView={setCurrentView} />}
          </main>
        </div>
      </ProposalProvider>
    </WalletProvider>
  )
}

export default App