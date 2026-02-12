import { test as base, expect, BrowserContext, Page } from '@playwright/test';
import { MetaMaskPage } from '../pages/metamask.page';
import { ethers } from 'ethers';

/**
 * DApp test context fixture
 * 
 * Extends the base Playwright test with:
 * - MetaMask page object
 * - Blockchain provider
 * - Test wallet utilities
 */
export type DAppTestContext = {
  context: BrowserContext;
  page: Page;
  metamask: MetaMaskPage;
  provider: ethers.JsonRpcProvider;
  testWallet: ethers.Wallet;
};

/**
 * Extended test fixture with DApp-specific utilities
 */
export const test = base.extend<DAppTestContext>({
  // Override context to load MetaMask extension
  context: async ({ browser }, use) => {
    // Launch context with MetaMask extension
    // Note: In real implementation, you'd need to specify the path to MetaMask extension
    const context = await browser.newContext({
      // Enable extension loading (requires browser-specific setup)
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    await use(context);
    await context.close();
  },

  // Initialize MetaMask page object
  metamask: async ({ context }, use) => {
    const metamask = new MetaMaskPage(context);
    await metamask.initialize();
    await use(metamask);
  },

  // Blockchain provider
  provider: async ({}, use) => {
    const rpcUrl = process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    await use(provider);
  },

  // Test wallet
  testWallet: async ({ provider }, use) => {
    // Use private key from environment or generate a test wallet
    const privateKey = process.env.TEST_WALLET_PRIVATE_KEY || 
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(privateKey, provider);
    await use(wallet);
  },
});

/**
 * Test fixture with pre-configured wallet
 * 
 * Use this for tests that need a wallet with pre-funded account
 */
export const testWithWallet = test.extend<{ fundedWallet: ethers.Wallet }>({
  fundedWallet: async ({ provider }, use) => {
    const privateKey = process.env.TEST_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('TEST_WALLET_PRIVATE_KEY not set');
    }
    const wallet = new ethers.Wallet(privateKey, provider);
    await use(wallet);
  },
});

export { expect };
