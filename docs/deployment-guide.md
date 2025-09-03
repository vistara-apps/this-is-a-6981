# SolVote Deployment Guide

This guide provides step-by-step instructions for deploying the SolVote platform, including the Anchor program and frontend application.

## Overview

Deploying SolVote involves two main components:

1. **Anchor Program**: The Solana smart contract that powers the on-chain voting functionality
2. **Frontend Application**: The React application that provides the user interface

## Prerequisites

Before you begin, ensure you have the following:

- Solana CLI (v1.10.0 or later)
- Anchor CLI (v0.24.0 or later)
- Node.js (v14 or later)
- npm or yarn
- A Solana wallet with SOL for deployment fees
- Git

## Deploying the Anchor Program

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/solvote.git
cd solvote
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Solana CLI

```bash
# Set Solana CLI to the desired network (localnet, devnet, or mainnet-beta)
solana config set --url devnet

# Check your configuration
solana config get
```

### Step 4: Generate a Keypair (if you don't have one)

```bash
solana-keygen new -o ~/.config/solana/id.json
```

### Step 5: Fund Your Wallet

```bash
# For devnet
solana airdrop 2 your-public-key

# For mainnet-beta, you'll need to transfer SOL from an exchange or another wallet
```

### Step 6: Update Anchor.toml

Edit the `Anchor.toml` file to set the correct program ID and wallet path:

```toml
[programs.devnet]
solvote = "your-program-id"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

### Step 7: Build the Anchor Program

```bash
anchor build
```

### Step 8: Get the Program ID

```bash
solana address -k target/deploy/solvote-keypair.json
```

Update the program ID in `Anchor.toml` and `lib.rs` with the output from the command above.

### Step 9: Deploy the Anchor Program

```bash
# Using the deployment script
node scripts/deploy.js devnet ~/.config/solana/id.json

# Or using Anchor CLI directly
anchor deploy
```

### Step 10: Verify the Deployment

```bash
# Using the verification script
node scripts/verify.js devnet your-program-id

# Or using Anchor CLI directly
anchor verify your-program-id --provider.cluster devnet
```

## Deploying the Frontend Application

### Step 1: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=your-program-id
VITE_RPC_URL=https://api.devnet.solana.com
```

### Step 2: Build the Frontend

```bash
npm run build
# or
yarn build
```

### Step 3: Deploy to a Hosting Service

You can deploy the frontend to various hosting services such as Vercel, Netlify, or GitHub Pages.

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy
```

#### GitHub Pages

```bash
# Install gh-pages
npm install -g gh-pages

# Deploy
gh-pages -d dist
```

## Deploying to Production (Mainnet)

When you're ready to deploy to production (Solana Mainnet Beta), follow these additional steps:

### Step 1: Update Anchor.toml for Mainnet

```toml
[programs.mainnet]
solvote = "your-program-id"

[provider]
cluster = "mainnet-beta"
wallet = "~/.config/solana/id.json"
```

### Step 2: Deploy to Mainnet

```bash
# Using the deployment script
node scripts/deploy.js mainnet-beta ~/.config/solana/id.json

# Or using Anchor CLI directly
anchor deploy --provider.cluster mainnet-beta
```

### Step 3: Verify the Mainnet Deployment

```bash
# Using the verification script
node scripts/verify.js mainnet-beta your-program-id

# Or using Anchor CLI directly
anchor verify your-program-id --provider.cluster mainnet-beta
```

### Step 4: Update Frontend Environment Variables

Update the `.env` file for production:

```
VITE_SOLANA_NETWORK=mainnet-beta
VITE_PROGRAM_ID=your-program-id
VITE_RPC_URL=https://api.mainnet-beta.solana.com
```

### Step 5: Build and Deploy the Frontend

```bash
npm run build
# or
yarn build

# Deploy to your hosting service
```

## Deployment Dashboard

SolVote includes a Deployment Dashboard component that provides a user-friendly interface for deploying and verifying the Anchor program. To use the Deployment Dashboard:

1. Connect your wallet
2. Select the target network (localnet, devnet, or mainnet-beta)
3. Select or generate a keypair for deployment
4. Click "Deploy" to deploy the program
5. Click "Verify" to verify the program and upload source code to Arweave

## Security Considerations

When deploying to production, consider the following security best practices:

1. **Secure Keypair Management**: Keep your deployment keypair secure and never share it.
2. **Program Upgrades**: Consider using a program upgrade authority to allow for future upgrades.
3. **Rate Limiting**: Implement rate limiting on your frontend to prevent abuse.
4. **Input Validation**: Validate all user inputs on the frontend before sending transactions.
5. **Error Handling**: Implement proper error handling to provide a good user experience.

## Troubleshooting

### Common Issues

#### Insufficient Funds

```
Error: Insufficient funds for fee
```

Solution: Ensure your wallet has enough SOL to cover deployment fees.

#### Program ID Mismatch

```
Error: Program ID mismatch
```

Solution: Ensure the program ID in `Anchor.toml` and `lib.rs` match the output of `solana address -k target/deploy/solvote-keypair.json`.

#### Build Errors

```
Error: Failed to build program
```

Solution: Check your Rust code for errors and ensure you have the correct Anchor version installed.

#### Deployment Errors

```
Error: Failed to deploy program
```

Solution: Check your Solana CLI configuration and ensure you have enough SOL for deployment fees.

#### Verification Errors

```
Error: Failed to verify program
```

Solution: Ensure you're using the correct program ID and network.

## Conclusion

By following this guide, you should be able to successfully deploy the SolVote platform to Solana. If you encounter any issues, please refer to the troubleshooting section or reach out to the SolVote community for assistance.

