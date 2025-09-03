# SolVote Frontend Integration Guide

This guide provides comprehensive documentation for integrating with the SolVote frontend components and utilities.

## Overview

The SolVote frontend is built with React and provides components and utilities for interacting with the SolVote Anchor program on the Solana blockchain. It includes wallet integration, proposal management, voting functionality, and subscription management.

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- A Solana wallet (e.g., Phantom, Solflare)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/solvote.git
cd solvote

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

## Core Components

### WalletProvider

The `WalletProvider` component provides wallet connection functionality using the Solana wallet adapter.

```jsx
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      {/* Your app components */}
    </WalletProvider>
  );
}
```

### ProposalProvider

The `ProposalProvider` component provides proposal management functionality, including creating proposals, voting, and fetching proposals from the blockchain.

```jsx
import { ProposalProvider } from './context/ProposalContext';

function App() {
  return (
    <WalletProvider>
      <ProposalProvider>
        {/* Your app components */}
      </ProposalProvider>
    </WalletProvider>
  );
}
```

### SubscriptionProvider

The `SubscriptionProvider` component provides subscription management functionality, including plan selection, payment processing, and usage tracking.

```jsx
import { SubscriptionProvider } from './context/SubscriptionContext';

function App() {
  return (
    <WalletProvider>
      <ProposalProvider>
        <SubscriptionProvider>
          {/* Your app components */}
        </SubscriptionProvider>
      </ProposalProvider>
    </WalletProvider>
  );
}
```

## Hooks

### useWallet

The `useWallet` hook provides access to wallet-related functionality.

```jsx
import { useWallet } from './context/WalletContext';

function MyComponent() {
  const { isConnected, publicKey, connect, disconnect } = useWallet();
  
  return (
    <div>
      {isConnected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### useProposals

The `useProposals` hook provides access to proposal-related functionality.

```jsx
import { useProposals } from './context/ProposalContext';

function MyComponent() {
  const { 
    proposals, 
    loading, 
    error, 
    createProposal, 
    vote, 
    closeProposal 
  } = useProposals();
  
  const handleCreateProposal = async () => {
    const result = await createProposal({
      title: 'My Proposal',
      description: 'This is a proposal description',
      endTime: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
    });
    
    if (result.success) {
      console.log('Proposal created successfully!');
    }
  };
  
  return (
    <div>
      <button onClick={handleCreateProposal}>Create Proposal</button>
      
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      <ul>
        {proposals.map(proposal => (
          <li key={proposal.id}>
            <h3>{proposal.title}</h3>
            <p>{proposal.description}</p>
            <button onClick={() => vote(proposal.id, 'yes')}>Vote Yes</button>
            <button onClick={() => vote(proposal.id, 'no')}>Vote No</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### useSubscription

The `useSubscription` hook provides access to subscription-related functionality.

```jsx
import { useSubscription } from './context/SubscriptionContext';

function MyComponent() {
  const { 
    plans, 
    currentPlan, 
    subscriptionStatus, 
    updatePlan, 
    formatPrice 
  } = useSubscription();
  
  return (
    <div>
      <h2>Current Plan: {currentPlan.name}</h2>
      <p>Status: {subscriptionStatus}</p>
      <p>Price: {formatPrice(currentPlan.price)}</p>
      
      <h3>Available Plans</h3>
      <ul>
        {Object.values(plans).map(plan => (
          <li key={plan.id}>
            <h4>{plan.name}</h4>
            <p>{formatPrice(plan.price)}</p>
            <button onClick={() => updatePlan(plan.id)}>
              {currentPlan.id === plan.id ? 'Current Plan' : 'Select Plan'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## UI Components

### ProposalCard

The `ProposalCard` component displays a proposal with voting buttons.

```jsx
import ProposalCard from './components/ProposalCard';

function MyComponent() {
  const handleVote = (proposal, voteType) => {
    // Handle vote
  };
  
  const handleClose = (proposalId) => {
    // Handle close
  };
  
  return (
    <ProposalCard
      proposal={proposal}
      onVote={handleVote}
      onClose={handleClose}
    />
  );
}
```

### VoteModal

The `VoteModal` component displays a modal for confirming a vote.

```jsx
import { useState } from 'react';
import VoteModal from './components/VoteModal';

function MyComponent() {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  
  const handleVote = (proposal) => {
    setSelectedProposal(proposal);
    setIsVoteModalOpen(true);
  };
  
  return (
    <div>
      {/* Other components */}
      
      {selectedProposal && (
        <VoteModal
          proposal={selectedProposal}
          isOpen={isVoteModalOpen}
          onClose={() => {
            setIsVoteModalOpen(false);
            setSelectedProposal(null);
          }}
        />
      )}
    </div>
  );
}
```

### CreateProposalForm

The `CreateProposalForm` component displays a form for creating a new proposal.

```jsx
import CreateProposalForm from './components/CreateProposalForm';

function MyComponent() {
  const handleCreateProposal = (proposalData) => {
    // Handle create proposal
  };
  
  return (
    <CreateProposalForm
      onSubmit={handleCreateProposal}
      onCancel={() => {/* Handle cancel */}}
    />
  );
}
```

### SubscriptionPlans

The `SubscriptionPlans` component displays available subscription plans.

```jsx
import SubscriptionPlans from './components/SubscriptionPlans';

function MyComponent() {
  return (
    <SubscriptionPlans />
  );
}
```

### PaymentForm

The `PaymentForm` component displays a form for adding a payment method.

```jsx
import PaymentForm from './components/PaymentForm';

function MyComponent() {
  const handlePaymentSuccess = (paymentDetails) => {
    // Handle payment success
  };
  
  return (
    <PaymentForm
      onSuccess={handlePaymentSuccess}
      onCancel={() => {/* Handle cancel */}}
    />
  );
}
```

### DeploymentDashboard

The `DeploymentDashboard` component displays a dashboard for deploying and verifying the Anchor program.

```jsx
import DeploymentDashboard from './components/DeploymentDashboard';

function MyComponent() {
  return (
    <DeploymentDashboard />
  );
}
```

## Utilities

### Anchor Utilities

The `anchor.js` utility provides functions for interacting with the SolVote Anchor program.

```javascript
import {
  getConnection,
  getProvider,
  getProgram,
  findVotingInstancePDA,
  findProposalPDA,
  initializeVotingInstance,
  createProposal,
  voteOnProposal,
  closeProposal,
  getAllProposals,
  hasVoted
} from './utils/anchor';

// Example: Initialize voting instance
const wallet = /* Get wallet */;
const result = await initializeVotingInstance(wallet);

// Example: Create proposal
const proposalResult = await createProposal(
  wallet,
  'My Proposal',
  'This is a proposal description',
  Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days from now
);

// Example: Vote on proposal
const voteResult = await voteOnProposal(wallet, proposalId, 'yes');

// Example: Close proposal
const closeResult = await closeProposal(wallet, proposalId);

// Example: Get all proposals
const proposalsResult = await getAllProposals(wallet);
```

### Arweave Utilities

The `arweave.js` utility provides functions for interacting with Arweave for permanent storage.

```javascript
import {
  uploadToArweave,
  getFromArweave,
  getArweaveTags,
  getArweaveUrl,
  getArweaveExplorerUrl
} from './utils/arweave';

// Example: Upload data to Arweave
const wallet = /* Get Arweave wallet */;
const txId = await uploadToArweave('Hello, world!', { type: 'text/plain' }, wallet);

// Example: Get data from Arweave
const data = await getFromArweave(txId);

// Example: Get Arweave URL
const url = getArweaveUrl(txId);
```

### Keypair Utilities

The `keypair.js` utility provides functions for managing Solana keypairs.

```javascript
import {
  generateKeypair,
  keypairToString,
  stringToKeypair,
  base58ToKeypair,
  keypairToBase58,
  storeKeypair,
  retrieveKeypair,
  listStoredKeypairs,
  deleteKeypair
} from './utils/keypair';

// Example: Generate a keypair
const keypair = generateKeypair();

// Example: Store a keypair
const success = storeKeypair(keypair, 'my-keypair', 'password');

// Example: Retrieve a keypair
const retrievedKeypair = retrieveKeypair('my-keypair', 'password');

// Example: List stored keypairs
const keypairs = listStoredKeypairs();
```

### Stripe Utilities

The `stripe.js` utility provides functions for interacting with Stripe for payment processing.

```javascript
import {
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscription,
  createPaymentMethod,
  createCustomer,
  createCheckoutSession
} from './utils/stripe';

// Example: Create a payment method
const paymentMethod = await createPaymentMethod({
  type: 'card',
  card: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  }
});

// Example: Create a customer
const customer = await createCustomer({
  email: 'user@example.com',
  name: 'John Doe'
});

// Example: Create a subscription
const subscription = await createSubscription({
  customerId: customer.id,
  priceId: 'price_123',
  paymentMethodId: paymentMethod.id
});
```

## Conclusion

This guide provides a comprehensive overview of the SolVote frontend components and utilities. By following this documentation, developers can integrate with the SolVote platform to create and manage voting proposals, cast votes, and handle subscriptions.

