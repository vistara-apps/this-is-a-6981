import React from 'react'
import { Wallet, LogOut, Copy } from 'lucide-react'
import { useWallet } from '../context/WalletContext'

const WalletConnector = () => {
  const { isConnected, publicKey, connect, disconnect } = useWallet()

  const formatPublicKey = (key) => {
    if (!key) return ''
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="card px-3 py-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-mono text-text-secondary">
            {formatPublicKey(publicKey)}
          </span>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-surface/50 rounded transition-colors"
            title="Copy address"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={disconnect}
          className="btn-secondary px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      className="btn-primary px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </button>
  )
}

export default WalletConnector