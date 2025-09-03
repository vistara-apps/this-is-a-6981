# SolVote

Launch Verifiable On-Chain Voting DApps on Solana in Minutes.

## Overview

SolVote is a platform that enables founders to quickly deploy secure, verifiable on-chain voting dApps on Solana, facilitating proposal creation and voting. It provides a pre-built, audited Solana program written in Rust using the Anchor framework, capable of handling proposal creation, voting mechanisms, and tallying results.

## Features

- **Solana Voting Program (Anchor)**: A pre-built, audited Solana program written in Rust using the Anchor framework, capable of handling proposal creation, voting mechanisms, and tallying results.
- **React Frontend**: A basic, functional React frontend with a simple UI for interacting with the Solana program. Allows users to connect their Phantom wallet, create proposals, and cast their votes.
- **Verifiable Deployment**: Automated process to deploy the Anchor program to Solana Mainnet Beta and ensure its verifiability on-chain, including linking the source code repository (GitHub).
- **Secure Key Management**: Guidance and tools for securely managing program deployer keypairs, crucial for maintaining control over deployed smart contracts.
- **Monetization Integration**: Includes basic integration points for collecting fees or payments, allowing founders to monetize their dApp from day one.
- **Early User Acquisition Guidance**: Provides strategies and channels for finding initial users and gathering feedback to validate product-market fit.

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Solana CLI (v1.10.0 or later)
- Anchor CLI (v0.24.0 or later)
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

### Deployment

To deploy the Anchor program to Solana:

```bash
# Deploy to localnet
npm run deploy

# Deploy to devnet
npm run deploy:devnet

# Deploy to mainnet-beta
npm run deploy:mainnet
```

### Verification

To verify the Anchor program on Solana:

```bash
# Verify on devnet
npm run verify:devnet <program-id>

# Verify on mainnet-beta
npm run verify:mainnet <program-id>
```

## Documentation

For detailed documentation, see the following:

- [Anchor Program Documentation](./docs/anchor-program.md)
- [Frontend Integration Guide](./docs/frontend-integration.md)
- [Deployment Guide](./docs/deployment-guide.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Solana](https://solana.com/)
- [Anchor](https://project-serum.github.io/anchor/)
- [Phantom Wallet](https://phantom.app/)
- [Arweave](https://www.arweave.org/)

