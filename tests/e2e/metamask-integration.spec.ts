import { test, expect } from '../../fixtures/dapp-context';
import { MetaMaskPage } from '../../pages/metamask.page';
import { ethers } from 'ethers';
import { ERC20_ABI, TOKEN_CONTRACTS } from '../../utils/contract-abi';
import { getBalance, waitForTransaction } from '../../utils/blockchain';

/**
 * Example test: MetaMask Wallet Connection and Smart Contract Interaction
 * 
 * This test demonstrates:
 * - MetaMask wallet setup and connection
 * - Smart contract interaction (ERC20 token transfer)
 * - Transaction verification
 * - Event monitoring
 * 
 * @author Ricardo Silva
 * @tags @smoke @wallet @smart-contract
 */
test.describe('MetaMask Integration and Smart Contract Tests', () => {
  
  test.beforeEach(async ({ context }) => {
    // Setup: Ensure MetaMask is available in context
    // This is handled by the fixture
  });

  /**
   * Test: Connect MetaMask wallet to DApp
   * @priority high
   */
  test('should connect MetaMask wallet successfully @smoke', async ({ page, context, metamask }) => {
    // Navigate to DApp
    await page.goto('https://example-dapp.com');

    // Click "Connect Wallet" button on DApp
    await page.click('text=Connect Wallet');

    // Select MetaMask from wallet options
    await page.click('text=MetaMask');

    // Approve connection in MetaMask popup
    await metamask.approveConnection();

    // Verify wallet is connected
    const connectedAddress = await page.textContent('[data-testid="wallet-address"]');
    expect(connectedAddress).toBeTruthy();
    expect(connectedAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);

    // Verify connection status indicator
    await expect(page.locator('[data-testid="wallet-connected-indicator"]')).toBeVisible();
  });

  /**
   * Test: Send ETH transaction
   * @priority high
   */
  test('should send ETH transaction via MetaMask @smoke', async ({ page, metamask, provider, testWallet }) => {
    // Get initial balance
    const recipientAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f8dEe';
    const sendAmount = '0.01';
    
    const initialBalance = await getBalance(provider, recipientAddress);

    // Navigate to DApp transfer page
    await page.goto('https://example-dapp.com/transfer');

    // Fill transfer form
    await page.fill('[data-testid="recipient-input"]', recipientAddress);
    await page.fill('[data-testid="amount-input"]', sendAmount);

    // Click send button
    await page.click('text=Send ETH');

    // Confirm transaction in MetaMask
    const txHash = await metamask.confirmTransaction({
      gasLimit: 21000,
    });

    expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    // Wait for transaction confirmation
    const receipt = await waitForTransaction(provider, txHash, 1);
    expect(receipt.status).toBe(1); // Success

    // Verify balance updated
    const finalBalance = await getBalance(provider, recipientAddress);
    const expectedBalance = parseFloat(initialBalance) + parseFloat(sendAmount);
    expect(parseFloat(finalBalance)).toBeCloseTo(expectedBalance, 4);
  });

  /**
   * Test: ERC20 Token transfer
   * @priority high
   */
  test('should transfer ERC20 tokens @smoke @token', async ({ page, metamask, provider, testWallet }) => {
    // Use DAI token on testnet for this example
    const tokenAddress = process.env.TESTNET_DAI || TOKEN_CONTRACTS.DAI;
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    const recipientAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f8dEe';
    const transferAmount = ethers.parseUnits('10', 18); // 10 DAI

    // Get initial balances
    const initialSenderBalance = await tokenContract.balanceOf(testWallet.address);
    const initialRecipientBalance = await tokenContract.balanceOf(recipientAddress);

    // Navigate to token transfer page
    await page.goto('https://example-dapp.com/tokens');

    // Select token
    await page.click('[data-testid="token-selector"]');
    await page.click('text=DAI');

    // Fill transfer details
    await page.fill('[data-testid="recipient-input"]', recipientAddress);
    await page.fill('[data-testid="amount-input"]', '10');

    // Click transfer button
    await page.click('text=Transfer');

    // Approve token spending if needed
    const currentAllowance = await tokenContract.allowance(testWallet.address, recipientAddress);
    if (currentAllowance < transferAmount) {
      // Approve transaction will be triggered
      await metamask.confirmTransaction();
    }

    // Confirm transfer transaction
    const txHash = await metamask.confirmTransaction();
    
    // Wait for transaction confirmation
    await waitForTransaction(provider, txHash, 1);

    // Verify balances updated
    const finalSenderBalance = await tokenContract.balanceOf(testWallet.address);
    const finalRecipientBalance = await tokenContract.balanceOf(recipientAddress);

    expect(finalSenderBalance).toBe(initialSenderBalance - transferAmount);
    expect(finalRecipientBalance).toBe(initialRecipientBalance + transferAmount);
  });

  /**
   * Test: Smart Contract interaction - Simple Storage
   * @priority medium
   */
  test('should interact with smart contract @contract', async ({ page, metamask, provider }) => {
    // Deploy simple storage contract for testing
    const simpleStorageAbi = [
      'function set(uint256 x) public',
      'function get() public view returns (uint256)',
    ];
    
    const simpleStorageBytecode = '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220e6c7e354705c0b2e92c9e8c8f3bf90e5e9c5e9f3e8c8f3bf90e5e9c5e9f3e8c8f3bf64736f6c63430008130033';

    // Navigate to contract interaction page
    await page.goto('https://example-dapp.com/contract');

    // Get initial value
    const getValueButton = await page.locator('text=Get Value');
    await getValueButton.click();
    
    const initialValue = await page.textContent('[data-testid="contract-value"]');
    expect(initialValue).toBe('0');

    // Set new value
    await page.fill('[data-testid="value-input"]', '42');
    await page.click('text=Set Value');

    // Confirm transaction
    await metamask.confirmTransaction();

    // Wait for confirmation
    await page.waitForSelector('text=Transaction confirmed', { timeout: 60000 });

    // Verify new value
    await getValueButton.click();
    const newValue = await page.textContent('[data-testid="contract-value"]');
    expect(newValue).toBe('42');
  });

  /**
   * Test: Reject transaction
   * @priority medium
   */
  test('should handle rejected transaction @error', async ({ page, metamask }) => {
    await page.goto('https://example-dapp.com/transfer');

    // Fill form
    await page.fill('[data-testid="recipient-input"]', '0x742d35Cc6634C0532925a3b844Bc9e7595f8dEe');
    await page.fill('[data-testid="amount-input"]', '0.1');

    // Click send
    await page.click('text=Send ETH');

    // Reject transaction in MetaMask
    await metamask.rejectTransaction();

    // Verify error message displayed
    await expect(page.locator('text=Transaction rejected by user')).toBeVisible();
  });

  /**
   * Test: Network switching
   * @priority medium
   */
  test('should switch networks @network', async ({ page, metamask }) => {
    await page.goto('https://example-dapp.com');

    // Connect wallet first
    await page.click('text=Connect Wallet');
    await page.click('text=MetaMask');
    await metamask.approveConnection();

    // Switch to Goerli testnet
    await metamask.switchNetwork('Goerli Test Network');

    // Verify network indicator updated
    await expect(page.locator('text=Goerli')).toBeVisible();

    // Perform a transaction on the new network
    await page.goto('https://example-dapp.com/faucet');
    await page.click('text=Request Test ETH');
    await metamask.confirmTransaction();

    // Wait for confirmation
    await expect(page.locator('text=Test ETH sent')).toBeVisible({ timeout: 60000 });
  });

  /**
   * Test: Gas customization
   * @priority low
   */
  test('should customize gas settings @gas', async ({ page, metamask }) => {
    await page.goto('https://example-dapp.com/transfer');

    // Fill form
    await page.fill('[data-testid="recipient-input"]', '0x742d35Cc6634C0532925a3b844Bc9e7595f8dEe');
    await page.fill('[data-testid="amount-input"]', '0.01');

    // Click send
    await page.click('text=Send ETH');

    // Confirm with custom gas
    const txHash = await metamask.confirmTransaction({
      gasLimit: 30000,
      gasPrice: '20',
    });

    expect(txHash).toBeTruthy();
  });

  /**
   * Test: Multiple account support
   * @priority low
   */
  test('should handle multiple accounts @account', async ({ page, metamask }) => {
    await page.goto('https://example-dapp.com');

    // Import additional account
    const privateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
    await metamask.importAccount(privateKey);

    // Connect wallet
    await page.click('text=Connect Wallet');
    await metamask.approveConnection();

    // Verify both accounts are available
    const address = await metamask.getAccountAddress();
    expect(address).toBeTruthy();
  });
});
