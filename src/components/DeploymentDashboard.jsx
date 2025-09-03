import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Server, Upload, Check, AlertTriangle, Copy, ExternalLink, Key, RefreshCw } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

const DeploymentDashboard = () => {
  const { isConnected, publicKey, formatAddress } = useWallet();
  const { checkLimit, updateUsage } = useSubscription();
  
  const [network, setNetwork] = useState('devnet');
  const [deploymentStatus, setDeploymentStatus] = useState('idle'); // idle, deploying, success, error
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, verifying, success, error
  const [deploymentError, setDeploymentError] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [programId, setProgramId] = useState(null);
  const [arweaveLink, setArweaveLink] = useState(null);
  const [isKeypairModalOpen, setIsKeypairModalOpen] = useState(false);
  const [selectedKeypair, setSelectedKeypair] = useState(null);
  const [generatingKeypair, setGeneratingKeypair] = useState(false);
  
  // Mock keypairs
  const [keypairs, setKeypairs] = useState([
    { id: 1, name: 'Deployment Keypair 1', publicKey: 'BvR16Dd942XFCaKA4zQhwmP2Yzqv8MJtqbBC9mHwjLcS' },
    { id: 2, name: 'Deployment Keypair 2', publicKey: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS' }
  ]);
  
  const handleDeploy = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!selectedKeypair) {
      setIsKeypairModalOpen(true);
      return;
    }
    
    // Check subscription limits
    if (!checkLimit('deployments')) {
      alert('You have reached the maximum number of deployments allowed by your subscription plan. Please upgrade to deploy more programs.');
      return;
    }
    
    setDeploymentStatus('deploying');
    setDeploymentError(null);
    
    try {
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update usage statistics
      updateUsage('deployments');
      
      // Set program ID (in a real implementation, this would come from the deployment)
      setProgramId('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
      
      setDeploymentStatus('success');
    } catch (error) {
      console.error('Error deploying program:', error);
      setDeploymentError(error.message || 'An error occurred during deployment');
      setDeploymentStatus('error');
    }
  };
  
  const handleVerify = async () => {
    if (!programId) {
      alert('Please deploy the program first');
      return;
    }
    
    setVerificationStatus('verifying');
    setVerificationError(null);
    
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set Arweave link (in a real implementation, this would come from the verification)
      setArweaveLink('https://arweave.net/abc123');
      
      setVerificationStatus('success');
    } catch (error) {
      console.error('Error verifying program:', error);
      setVerificationError(error.message || 'An error occurred during verification');
      setVerificationStatus('error');
    }
  };
  
  const handleGenerateKeypair = async () => {
    setGeneratingKeypair(true);
    
    try {
      // Simulate keypair generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a random public key
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let publicKey = '';
      for (let i = 0; i < 44; i++) {
        publicKey += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Add the new keypair
      const newKeypair = {
        id: keypairs.length + 1,
        name: `Deployment Keypair ${keypairs.length + 1}`,
        publicKey
      };
      
      setKeypairs([...keypairs, newKeypair]);
      setSelectedKeypair(newKeypair);
    } catch (error) {
      console.error('Error generating keypair:', error);
    } finally {
      setGeneratingKeypair(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">Deployment Dashboard</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Deploy and verify your SolVote Anchor program on the Solana blockchain.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Deployment Configuration */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface/30 p-6 rounded-xl border border-surface/50">
            <h2 className="text-xl font-bold text-text-primary mb-4">Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Network
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full px-4 py-2 bg-surface/50 border border-surface/80 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="localnet">Localnet</option>
                  <option value="devnet">Devnet</option>
                  <option value="mainnet-beta">Mainnet Beta</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Deployment Keypair
                </label>
                {selectedKeypair ? (
                  <div className="flex items-center justify-between bg-surface/50 p-3 rounded-lg border border-surface/80">
                    <div>
                      <div className="text-text-primary font-medium">{selectedKeypair.name}</div>
                      <div className="text-text-secondary text-xs font-mono mt-1">
                        {formatAddress(selectedKeypair.publicKey)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsKeypairModalOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setIsKeypairModalOpen(true)}
                    leftIcon={<Key />}
                  >
                    Select Keypair
                  </Button>
                )}
              </div>
              
              <Button
                variant="primary"
                fullWidth
                onClick={handleDeploy}
                loading={deploymentStatus === 'deploying'}
                disabled={!isConnected || deploymentStatus === 'deploying'}
                leftIcon={<Server />}
              >
                Deploy Program
              </Button>
            </div>
          </div>
          
          <div className="bg-surface/30 p-6 rounded-xl border border-surface/50">
            <h2 className="text-xl font-bold text-text-primary mb-4">Verification</h2>
            <p className="text-text-secondary text-sm mb-4">
              Verify your program on-chain and upload source code to Arweave for transparency.
            </p>
            
            <Button
              variant="primary"
              fullWidth
              onClick={handleVerify}
              loading={verificationStatus === 'verifying'}
              disabled={
                !programId || 
                verificationStatus === 'verifying' || 
                deploymentStatus === 'deploying'
              }
              leftIcon={<Upload />}
            >
              Verify & Upload Source
            </Button>
          </div>
        </div>
        
        {/* Deployment Status */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface/30 p-6 rounded-xl border border-surface/50">
            <h2 className="text-xl font-bold text-text-primary mb-4">Deployment Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  deploymentStatus === 'idle' ? 'bg-surface/50' :
                  deploymentStatus === 'deploying' ? 'bg-blue-500/20' :
                  deploymentStatus === 'success' ? 'bg-green-500/20' :
                  'bg-red-500/20'
                }`}>
                  {deploymentStatus === 'idle' && <Server className="w-5 h-5 text-text-secondary" />}
                  {deploymentStatus === 'deploying' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                  {deploymentStatus === 'success' && <Check className="w-5 h-5 text-green-500" />}
                  {deploymentStatus === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                </div>
                
                <div>
                  <h3 className="font-medium text-text-primary">
                    {deploymentStatus === 'idle' && 'Ready to Deploy'}
                    {deploymentStatus === 'deploying' && 'Deploying...'}
                    {deploymentStatus === 'success' && 'Deployment Successful'}
                    {deploymentStatus === 'error' && 'Deployment Failed'}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {deploymentStatus === 'idle' && 'Click the Deploy button to start deployment'}
                    {deploymentStatus === 'deploying' && 'This may take a few minutes'}
                    {deploymentStatus === 'success' && `Program deployed to ${network}`}
                    {deploymentStatus === 'error' && deploymentError}
                  </p>
                </div>
              </div>
              
              {programId && (
                <div className="bg-surface/50 p-4 rounded-lg border border-surface/80">
                  <div className="flex justify-between items-center">
                    <div className="text-text-secondary text-sm">Program ID</div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(programId)}
                        className="p-1 hover:bg-surface/80 rounded-full transition-colors"
                        title="Copy Program ID"
                      >
                        <Copy className="w-4 h-4 text-text-secondary" />
                      </button>
                      <a
                        href={`https://explorer.solana.com/address/${programId}?cluster=${network}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-surface/80 rounded-full transition-colors"
                        title="View on Solana Explorer"
                      >
                        <ExternalLink className="w-4 h-4 text-text-secondary" />
                      </a>
                    </div>
                  </div>
                  <div className="font-mono text-text-primary text-sm mt-1 break-all">
                    {programId}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-surface/30 p-6 rounded-xl border border-surface/50">
            <h2 className="text-xl font-bold text-text-primary mb-4">Verification Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  verificationStatus === 'idle' ? 'bg-surface/50' :
                  verificationStatus === 'verifying' ? 'bg-blue-500/20' :
                  verificationStatus === 'success' ? 'bg-green-500/20' :
                  'bg-red-500/20'
                }`}>
                  {verificationStatus === 'idle' && <Upload className="w-5 h-5 text-text-secondary" />}
                  {verificationStatus === 'verifying' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                  {verificationStatus === 'success' && <Check className="w-5 h-5 text-green-500" />}
                  {verificationStatus === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                </div>
                
                <div>
                  <h3 className="font-medium text-text-primary">
                    {verificationStatus === 'idle' && 'Ready to Verify'}
                    {verificationStatus === 'verifying' && 'Verifying...'}
                    {verificationStatus === 'success' && 'Verification Successful'}
                    {verificationStatus === 'error' && 'Verification Failed'}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {verificationStatus === 'idle' && 'Click the Verify button to start verification'}
                    {verificationStatus === 'verifying' && 'This may take a few minutes'}
                    {verificationStatus === 'success' && 'Program verified and source code uploaded to Arweave'}
                    {verificationStatus === 'error' && verificationError}
                  </p>
                </div>
              </div>
              
              {arweaveLink && (
                <div className="bg-surface/50 p-4 rounded-lg border border-surface/80">
                  <div className="flex justify-between items-center">
                    <div className="text-text-secondary text-sm">Arweave Link</div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(arweaveLink)}
                        className="p-1 hover:bg-surface/80 rounded-full transition-colors"
                        title="Copy Arweave Link"
                      >
                        <Copy className="w-4 h-4 text-text-secondary" />
                      </button>
                      <a
                        href={arweaveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-surface/80 rounded-full transition-colors"
                        title="View on Arweave"
                      >
                        <ExternalLink className="w-4 h-4 text-text-secondary" />
                      </a>
                    </div>
                  </div>
                  <div className="font-mono text-text-primary text-sm mt-1 break-all">
                    {arweaveLink}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Keypair Modal */}
      <Modal
        isOpen={isKeypairModalOpen}
        onClose={() => setIsKeypairModalOpen(false)}
        title="Select Deployment Keypair"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <p className="text-text-secondary">
            Select a keypair to use for deploying your program. This keypair will be the upgrade authority for your program.
          </p>
          
          <div className="space-y-2">
            {keypairs.map((keypair) => (
              <div
                key={keypair.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedKeypair?.id === keypair.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-surface/50 border-surface/80 hover:bg-surface/80'
                }`}
                onClick={() => setSelectedKeypair(keypair)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text-primary">{keypair.name}</div>
                    <div className="text-text-secondary text-xs font-mono mt-1">
                      {formatAddress(keypair.publicKey)}
                    </div>
                  </div>
                  {selectedKeypair?.id === keypair.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={handleGenerateKeypair}
              loading={generatingKeypair}
              leftIcon={<Key />}
            >
              Generate New Keypair
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setIsKeypairModalOpen(false)}
              disabled={!selectedKeypair}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeploymentDashboard;

