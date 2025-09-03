import React, { useState } from 'react';
import { Wallet, LogOut, Copy, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import Button from './Button';

const WalletConnector = () => {
  const { isConnected, isConnecting, publicKey, connect, disconnect, formatAddress } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-surface/50 px-3 py-2 rounded-lg flex items-center space-x-2 border border-surface/80">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-mono text-text-secondary">
            {formatAddress(publicKey)}
          </span>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-surface/80 rounded-full transition-colors"
            title={copied ? "Copied!" : "Copy address"}
          >
            <Copy className={`w-3 h-3 ${copied ? 'text-green-400' : 'text-text-secondary'}`} />
          </button>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={disconnect}
          leftIcon={<LogOut />}
        >
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={connect}
      loading={isConnecting}
      leftIcon={<Wallet />}
    >
      Connect Wallet
    </Button>
  );
};

export default WalletConnector;
