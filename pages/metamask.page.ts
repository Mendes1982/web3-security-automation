import { Page, BrowserContext, Locator, expect } from '@playwright/test';
import { ethers } from 'ethers';

/**
 * Network configuration interface
 */
export interface NetworkConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

/**
 * Transaction options interface
 */
export interface TransactionOptions {
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  value?: string;
  data?: string;
}

/**
 * MetaMaskPage - Page Object for MetaMask wallet interactions
 * 
 * This class provides methods to interact with MetaMask extension
 * for testing Web3 DApps. It handles wallet connection, transaction
 * signing, network switching, and account management.
 * 
 * @author Ricardo Silva
 * @example
 * ```typescript
 * const metamask = new MetaMaskPage(context);
 * await metamask.connect();
 * await metamask.approveConnection();
 * await metamask.confirmTransaction();
 * ```
 */
export class MetaMaskPage {
  private context: BrowserContext;
  private metamaskPage: Page | null = null;
  private extensionId: string | null = null;

  // Locators for MetaMask UI elements
  private readonly locators = {
    // Welcome screen
    getStartedButton: 'text=Get Started',
    importWalletButton: 'text=Import wallet',
    createWalletButton: 'text=Create a new wallet',
    
    // Import/Create wallet
    agreeButton: 'text=I agree',
    passwordInput: 'input[type="password"]',
    confirmPasswordInput: 'input[placeholder="Confirm password"]',
    termsCheckbox: 'input[type="checkbox"]',
    importButton: 'text=Import',
    createButton: 'text=Create',
    
    // Secret recovery phrase
    recoveryPhraseInput: '[data-testid="recovery-phrase-input"]',
    revealSeedButton: 'text=Reveal Secret Recovery Phrase',
    confirmSeedButton: 'text=Confirm',
    
    // Main wallet
    accountButton: '[data-testid="account-menu-icon"]',
    networkButton: '[data-testid="network-display"]',
    
    // Connection popup
    connectButton: 'text=Connect',
    cancelButton: 'text=Cancel',
    
    // Transaction popup
    confirmTxButton: 'text=Confirm',
    rejectTxButton: 'text=Reject',
    editGasButton: 'text=Edit',
    gasPriceInput: 'input[data-testid="gas-price-input"]',
    gasLimitInput: 'input[data-testid="gas-limit-input"]',
    saveGasButton: 'text=Save',
    
    // Network switch
    switchNetworkButton: 'text=Switch Network',
    approveNetworkButton: 'text=Approve',
    
    // Notifications
    notificationItem: '.notification-item',
    closeNotificationButton: '[data-testid="close-notification"]',
  };

  constructor(context: BrowserContext) {
    this.context = context;
  }

  /**
   * Initialize MetaMask extension
   * Opens the MetaMask extension page and stores the extension ID
   */
  async initialize(): Promise<void> {
    // Get all pages in context
    const pages = this.context.pages();
    
    // Find MetaMask extension page
    for (const page of pages) {
      const url = page.url();
      if (url.includes('chrome-extension://') || url.includes('moz-extension://')) {
        this.metamaskPage = page;
        // Extract extension ID from URL
        const match = url.match(/chrome-extension:\/\/([a-z]+)/);
        if (match) {
          this.extensionId = match[1];
        }
        break;
      }
    }

    // If MetaMask page not found, try to open it
    if (!this.metamaskPage && this.extensionId) {
      this.metamaskPage = await this.context.newPage();
      await this.metamaskPage.goto(`chrome-extension://${this.extensionId}/home.html`);
    }

    if (!this.metamaskPage) {
      throw new Error('MetaMask extension not found. Make sure it is installed.');
    }
  }

  /**
   * Import wallet using recovery phrase
   * @param mnemonic - 12 or 24 word recovery phrase
   * @param password - Wallet password
   */
  async importWallet(mnemonic: string, password: string): Promise<void> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Click "Get Started"
    await page.click(this.locators.getStartedButton);

    // Click "Import wallet"
    await page.click(this.locators.importWalletButton);

    // Click "I agree"
    await page.click(this.locators.agreeButton);

    // Enter recovery phrase
    const words = mnemonic.split(' ');
    for (let i = 0; i < words.length; i++) {
      await page.fill(`[data-testid="seed-phrase-word-${i}"]`, words[i]);
    }

    // Enter password
    await page.fill(this.locators.passwordInput, password);
    await page.fill(this.locators.confirmPasswordInput, password);

    // Check terms checkbox
    await page.check(this.locators.termsCheckbox);

    // Click Import
    await page.click(this.locators.importButton);

    // Wait for wallet to load
    await page.waitForSelector(this.locators.accountButton, { timeout: 30000 });
  }

  /**
   * Create a new wallet
   * @param password - Wallet password
   * @returns Recovery phrase
   */
  async createWallet(password: string): Promise<string> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Click "Get Started"
    await page.click(this.locators.getStartedButton);

    // Click "Create a new wallet"
    await page.click(this.locators.createWalletButton);

    // Click "I agree"
    await page.click(this.locators.agreeButton);

    // Enter password
    await page.fill(this.locators.passwordInput, password);
    await page.fill(this.locators.confirmPasswordInput, password);

    // Check terms checkbox
    await page.check(this.locators.termsCheckbox);

    // Click Create
    await page.click(this.locators.createButton);

    // Reveal and copy recovery phrase
    await page.click(this.locators.revealSeedButton);
    
    // Extract recovery phrase
    const phraseWords: string[] = [];
    for (let i = 0; i < 12; i++) {
      const word = await page.textContent(`[data-testid="seed-phrase-word-${i}"]`);
      if (word) phraseWords.push(word.trim());
    }

    // Confirm recovery phrase
    await page.click(this.locators.confirmSeedButton);

    // Wait for wallet to load
    await page.waitForSelector(this.locators.accountButton, { timeout: 30000 });

    return phraseWords.join(' ');
  }

  /**
   * Connect wallet to DApp
   * Handles the connection popup and approves the connection
   */
  async connect(): Promise<void> {
    // Wait for connection popup
    const popup = await this.waitForPopup();
    
    // Click Connect button
    await popup.click(this.locators.connectButton);
    
    // Wait for popup to close
    await popup.waitForEvent('close');
  }

  /**
   * Approve connection request
   */
  async approveConnection(): Promise<void> {
    const popup = await this.waitForPopup();
    await popup.click(this.locators.connectButton);
    await popup.waitForEvent('close');
  }

  /**
   * Reject connection request
   */
  async rejectConnection(): Promise<void> {
    const popup = await this.waitForPopup();
    await popup.click(this.locators.cancelButton);
    await popup.waitForEvent('close');
  }

  /**
   * Confirm transaction
   * @param options - Transaction options for gas customization
   */
  async confirmTransaction(options?: TransactionOptions): Promise<string> {
    const popup = await this.waitForPopup();

    // Handle gas customization if provided
    if (options) {
      await popup.click(this.locators.editGasButton);
      
      if (options.gasLimit) {
        await popup.fill(this.locators.gasLimitInput, options.gasLimit.toString());
      }
      
      if (options.gasPrice) {
        await popup.fill(this.locators.gasPriceInput, options.gasPrice);
      }
      
      await popup.click(this.locators.saveGasButton);
    }

    // Click confirm
    await popup.click(this.locators.confirmTxButton);

    // Wait for transaction to be submitted
    await popup.waitForEvent('close');

    // Return transaction hash (extracted from notification or page)
    // This is a simplified version - in real implementation,
    // you'd need to extract the actual transaction hash
    return '0x' + Math.random().toString(16).substr(2, 64);
  }

  /**
   * Reject transaction
   */
  async rejectTransaction(): Promise<void> {
    const popup = await this.waitForPopup();
    await popup.click(this.locators.rejectTxButton);
    await popup.waitForEvent('close');
  }

  /**
   * Switch to a different network
   * @param networkName - Name of the network (e.g., 'Ethereum Mainnet', 'Goerli')
   */
  async switchNetwork(networkName: string): Promise<void> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Click network button
    await page.click(this.locators.networkButton);

    // Click on the network
    await page.click(`text=${networkName}`);

    // Handle network switch popup if it appears
    try {
      const popup = await this.waitForPopup(5000);
      await popup.click(this.locators.switchNetworkButton);
      await popup.waitForEvent('close');
    } catch {
      // No popup, network switched automatically
    }
  }

  /**
   * Add a custom network
   * @param config - Network configuration
   */
  async addNetwork(config: NetworkConfig): Promise<void> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Open network menu
    await page.click(this.locators.networkButton);

    // Click "Add Network"
    await page.click('text=Add Network');

    // Fill network details
    await page.fill('[data-testid="network-form-chain-id"]', config.chainId.toString());
    await page.fill('[data-testid="network-form-chain-name"]', config.chainName);
    await page.fill('[data-testid="network-form-rpc-url"]', config.rpcUrls[0]);
    
    if (config.nativeCurrency) {
      await page.fill('[data-testid="network-form-ticker-symbol"]', config.nativeCurrency.symbol);
      await page.fill('[data-testid="network-form-ticker-decimals"]', config.nativeCurrency.decimals.toString());
    }

    if (config.blockExplorerUrls && config.blockExplorerUrls.length > 0) {
      await page.fill('[data-testid="network-form-block-explorer-url"]', config.blockExplorerUrls[0]);
    }

    // Save network
    await page.click('text=Save');

    // Approve if popup appears
    try {
      const popup = await this.waitForPopup(5000);
      await popup.click(this.locators.approveNetworkButton);
      await popup.waitForEvent('close');
    } catch {
      // No approval needed
    }
  }

  /**
   * Import an account using private key
   * @param privateKey - Private key (with or without 0x prefix)
   */
  async importAccount(privateKey: string): Promise<void> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Open account menu
    await page.click(this.locators.accountButton);

    // Click "Import Account"
    await page.click('text=Import Account');

    // Enter private key
    const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    await page.fill('[data-testid="import-account-private-key"]', key);

    // Click Import
    await page.click('text=Import');

    // Wait for account to be imported
    await page.waitForSelector('[data-testid="account-menu-icon"]', { timeout: 10000 });
  }

  /**
   * Get account address
   * @returns Ethereum address
   */
  async getAccountAddress(): Promise<string> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Click account button to show address
    await page.click(this.locators.accountButton);

    // Get address from tooltip or modal
    const addressElement = await page.locator('[data-testid="account-menu-icon"]').textContent();
    
    if (!addressElement) {
      throw new Error('Could not retrieve account address');
    }

    return addressElement.trim();
  }

  /**
   * Get account balance
   * @returns Balance in ETH
   */
  async getBalance(): Promise<string> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Get balance element
    const balanceElement = await page.locator('[data-testid="eth-overview__primary-currency"]').textContent();
    
    if (!balanceElement) {
      throw new Error('Could not retrieve account balance');
    }

    return balanceElement.trim();
  }

  /**
   * Sign a message
   * @param message - Message to sign
   * @returns Signature
   */
  async signMessage(message: string): Promise<string> {
    // Trigger sign message from DApp
    // This would typically be called from the DApp page
    const popup = await this.waitForPopup();

    // Click Sign button
    await popup.click('text=Sign');

    // Wait for popup to close
    await popup.waitForEvent('close');

    // Return signature (would need to be captured from DApp)
    return '0x' + Math.random().toString(16).substr(2, 130);
  }

  /**
   * Lock wallet
   */
  async lock(): Promise<void> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Open account menu
    await page.click(this.locators.accountButton);

    // Click Lock
    await page.click('text=Lock');
  }

  /**
   * Unlock wallet
   * @param password - Wallet password
   */
  async unlock(password: string): Promise<void> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Enter password
    await page.fill(this.locators.passwordInput, password);

    // Click Unlock
    await page.click('text=Unlock');

    // Wait for wallet to unlock
    await page.waitForSelector(this.locators.accountButton, { timeout: 10000 });
  }

  /**
   * Wait for MetaMask popup to appear
   * @param timeout - Timeout in milliseconds
   * @returns Popup page
   */
  private async waitForPopup(timeout = 30000): Promise<Page> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`MetaMask popup did not appear within ${timeout}ms`));
      }, timeout);

      const checkPopup = async () => {
        const pages = this.context.pages();
        for (const page of pages) {
          const url = page.url();
          // Check if it's a MetaMask popup
          if ((url.includes('notification') || url.includes('popup')) && 
              (url.includes('chrome-extension://') || url.includes('moz-extension://'))) {
            clearTimeout(timer);
            resolve(page);
            return;
          }
        }
        setTimeout(checkPopup, 500);
      };

      checkPopup();
    });
  }

  /**
   * Close any open notifications
   */
  async closeNotifications(): Promise<void> {
    if (!this.metamaskPage) return;

    const notifications = await this.metamaskPage.locator(this.locators.notificationItem).count();
    for (let i = 0; i < notifications; i++) {
      try {
        await this.metamaskPage.click(this.locators.closeNotificationButton);
      } catch {
        // Notification might have auto-closed
      }
    }
  }

  /**
   * Check if wallet is connected
   * @returns Boolean indicating connection status
   */
  async isConnected(): Promise<boolean> {
    if (!this.metamaskPage) {
      return false;
    }

    try {
      await this.metamaskPage.waitForSelector(this.locators.accountButton, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reset account (clears transaction history)
   */
  async resetAccount(): Promise<void> {
    if (!this.metamaskPage) {
      await this.initialize();
    }

    const page = this.metamaskPage!;

    // Open settings
    await page.click('[data-testid="account-options-menu-button"]');
    await page.click('text=Settings');

    // Navigate to Advanced
    await page.click('text=Advanced');

    // Click "Reset Account"
    await page.click('text=Reset Account');
    await page.click('text=Reset'); // Confirm

    // Go back to home
    await page.click('[data-testid="app-header-logo"]');
  }
}
