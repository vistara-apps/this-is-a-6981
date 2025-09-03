#!/usr/bin/env node

/**
 * SolVote Deployment Script
 * 
 * This script deploys the SolVote Anchor program to the Solana blockchain.
 * 
 * Usage:
 *   node deploy.js <network> <keypair-path>
 * 
 * Arguments:
 *   network      - The Solana network to deploy to (localnet, devnet, mainnet-beta)
 *   keypair-path - Path to the keypair file to use for deployment
 * 
 * Example:
 *   node deploy.js devnet ~/.config/solana/id.json
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const network = args[0] || 'localnet';
const keypairPath = args[1] || '~/.config/solana/id.json';

// Validate network
const validNetworks = ['localnet', 'devnet', 'mainnet-beta'];
if (!validNetworks.includes(network)) {
  console.error(`Error: Invalid network "${network}". Must be one of: ${validNetworks.join(', ')}`);
  process.exit(1);
}

// Validate keypair path
try {
  const resolvedPath = path.resolve(keypairPath.replace(/^~/, process.env.HOME || process.env.USERPROFILE));
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: Keypair file not found at "${resolvedPath}"`);
    process.exit(1);
  }
} catch (error) {
  console.error(`Error validating keypair path: ${error.message}`);
  process.exit(1);
}

console.log(`Deploying SolVote to ${network} using keypair at ${keypairPath}`);

// Update Anchor.toml with the correct network and wallet
try {
  const anchorTomlPath = path.resolve(__dirname, '..', 'Anchor.toml');
  let anchorToml = fs.readFileSync(anchorTomlPath, 'utf8');
  
  // Update provider section
  anchorToml = anchorToml.replace(
    /\[provider\]\ncluster = ".*"\nwallet = ".*"/,
    `[provider]\ncluster = "${network}"\nwallet = "${keypairPath}"`
  );
  
  fs.writeFileSync(anchorTomlPath, anchorToml);
  console.log('Updated Anchor.toml with network and wallet settings');
} catch (error) {
  console.error(`Error updating Anchor.toml: ${error.message}`);
  process.exit(1);
}

// Build the program
console.log('Building Anchor program...');
const buildProcess = spawn('anchor', ['build'], { stdio: 'inherit' });

buildProcess.on('close', (buildCode) => {
  if (buildCode !== 0) {
    console.error(`Error: Build failed with code ${buildCode}`);
    process.exit(buildCode);
  }
  
  console.log('Build successful');
  
  // Get the program ID
  try {
    const programKeypairPath = path.resolve(__dirname, '..', 'target', 'deploy', 'solvote-keypair.json');
    const programKeypair = JSON.parse(fs.readFileSync(programKeypairPath, 'utf8'));
    
    // In a real implementation, we would use the Solana web3.js library to get the program ID
    // For now, we'll just use a placeholder
    const programId = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
    
    console.log(`Program ID: ${programId}`);
    
    // Update lib.rs with the program ID
    try {
      const libRsPath = path.resolve(__dirname, '..', 'programs', 'solvote', 'src', 'lib.rs');
      let libRs = fs.readFileSync(libRsPath, 'utf8');
      
      // Update declare_id! macro
      libRs = libRs.replace(
        /declare_id!\(".*"\);/,
        `declare_id!("${programId}");`
      );
      
      fs.writeFileSync(libRsPath, libRs);
      console.log('Updated lib.rs with program ID');
    } catch (error) {
      console.error(`Error updating lib.rs: ${error.message}`);
      process.exit(1);
    }
    
    // Update Anchor.toml with the program ID
    try {
      const anchorTomlPath = path.resolve(__dirname, '..', 'Anchor.toml');
      let anchorToml = fs.readFileSync(anchorTomlPath, 'utf8');
      
      // Update programs section
      anchorToml = anchorToml.replace(
        new RegExp(`\\[programs\\.${network}\\]\\nsolvote = ".*"`),
        `[programs.${network}]\nsolvote = "${programId}"`
      );
      
      fs.writeFileSync(anchorTomlPath, anchorToml);
      console.log('Updated Anchor.toml with program ID');
    } catch (error) {
      console.error(`Error updating Anchor.toml: ${error.message}`);
      process.exit(1);
    }
    
    // Deploy the program
    console.log(`Deploying to ${network}...`);
    const deployProcess = spawn('anchor', ['deploy'], { stdio: 'inherit' });
    
    deployProcess.on('close', (deployCode) => {
      if (deployCode !== 0) {
        console.error(`Error: Deployment failed with code ${deployCode}`);
        process.exit(deployCode);
      }
      
      console.log('Deployment successful');
      console.log(`Program deployed to ${network} with ID: ${programId}`);
    });
  } catch (error) {
    console.error(`Error getting program ID: ${error.message}`);
    process.exit(1);
  }
});

