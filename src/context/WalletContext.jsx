import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import the wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  // Get network from environment variable or default to devnet
  const networkString = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
  const network = networkString === 'mainnet-beta' 
    ? WalletAdapterNetwork.Mainnet 
    : networkString === 'devnet' 
      ? WalletAdapterNetwork.Devnet 
      : WalletAdapterNetwork.Devnet;

  // Get RPC URL from environment variable or use default
  const rpcUrl = import.meta.env.VITE_RPC_URL || clusterApiUrl(network);

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => rpcUrl, [rpcUrl]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // so only the wallets you configure here will be compiled into your application
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

// This is a wrapper around the Solana wallet adapter to provide a simpler interface
const WalletContextProvider = ({ children }) => {
  const { 
    wallet, 
    publicKey, 
    connecting, 
    connected, 
    disconnect: solanaDisconnect,
    select,
    connect: solanaConnect,
    signTransaction,
    signAllTransactions,
    signMessage
  } = useContext(require('@solana/wallet-adapter-react').useWallet());

  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(null);

  // Connect to the wallet
  const connect = async () => {
    try {
      setIsConnecting(true);
      
      // If no wallet is selected, select Phantom by default
      if (!wallet) {
        select('phantom');
      }
      
      // Connect to the wallet
      await solanaConnect();
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from the wallet
  const disconnect = async () => {
    try {
      await solanaDisconnect();
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    }
  };

  // Get the wallet adapter for use with Anchor
  const getWalletAdapter = () => {
    if (!wallet || !publicKey) return null;
    
    return {
      publicKey,
      signTransaction,
      signAllTransactions,
      signMessage,
      // Add any other methods needed by Anchor
    };
  };

  // Format the wallet address for display
  const formatAddress = (address = publicKey?.toString()) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <WalletContext.Provider value={{
      isConnected: connected,
      isConnecting: connecting || isConnecting,
      publicKey: publicKey?.toString() || null,
      wallet,
      connect,
      disconnect,
      solanaWallet: wallet,
      walletAdapter: getWalletAdapter(),
      balance,
      formatAddress,
      signTransaction,
      signAllTransactions,
      signMessage
    }}>
      {children}
    </WalletContext.Provider>
  );
};
