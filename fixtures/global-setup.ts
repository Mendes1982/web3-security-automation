import { FullConfig } from '@playwright/test';
import { ethers } from 'ethers';

/**
 * Global Setup
 * 
 * Runs once before all test suites.
 * Used for:
 * - Starting local blockchain
 * - Deploying test contracts
 * - Setting up test accounts
 * - Configuring environment
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Web3 Security Automation Framework...');
  console.log('📦 Running global setup...\n');

  try {
    // Check environment variables
    const requiredEnvVars = ['LOCAL_RPC_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️  Missing optional environment variables:', missingVars.join(', '));
      console.log('Using default values for local testing...\n');
    }

    // Setup local blockchain connection if available
    const rpcUrl = process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545';
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const blockNumber = await provider.getBlockNumber();
      console.log(`✅ Connected to local blockchain at block ${blockNumber}`);

      // Check test wallet balance
      const testPrivateKey = process.env.TEST_WALLET_PRIVATE_KEY || 
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      const wallet = new ethers.Wallet(testPrivateKey, provider);
      const balance = await provider.getBalance(wallet.address);
      
      console.log(`✅ Test wallet: ${wallet.address}`);
      console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

      // Setup test data or contracts if needed
      console.log('📝 Setting up test environment...');
      
      // Here you can:
      // - Deploy test contracts
      // - Mint test tokens
      // - Create test accounts
      // - Fund test wallets
      
      console.log('✅ Global setup completed successfully!\n');
      
    } catch (error) {
      console.log('⚠️  Could not connect to local blockchain');
      console.log('   Make sure Hardhat node is running: npm run node:start\n');
      console.log('   Continuing with test setup...\n');
    }

    // Set global test data if needed
    process.env.TEST_RUN_TIMESTAMP = Date.now().toString();
    process.env.TEST_RUN_ID = `run-${Date.now()}`;

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
