import React, { createContext, useContext, useState } from 'react'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [publicKey, setPublicKey] = useState(null)

  const connect = async () => {
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate a mock Solana public key
    const mockPublicKey = 'A7X8k' + Math.random().toString(36).substring(2, 15) + 'xyz9'
    
    setPublicKey(mockPublicKey)
    setIsConnected(true)
  }

  const disconnect = () => {
    setPublicKey(null)
    setIsConnected(false)
  }

  return (
    <WalletContext.Provider value={{
      isConnected,
      publicKey,
      connect,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  )
}