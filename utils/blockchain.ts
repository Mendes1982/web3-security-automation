import { ethers } from 'ethers';

/**
 * Blockchain utilities for Web3 testing
 * 
 * Provides helper functions for:
 * - Transaction management
 * - Balance checking
 * - Contract deployment
 * - Event monitoring
 * - Gas estimation
 */

/**
 * Wait for transaction confirmation
 * @param provider - Ethereum provider
 * @param txHash - Transaction hash
 * @param confirmations - Number of confirmations to wait for
 * @returns Transaction receipt
 */
export async function waitForTransaction(
  provider: ethers.Provider,
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt> {
  const receipt = await provider.waitForTransaction(txHash, confirmations);
  if (!receipt) {
    throw new Error(`Transaction ${txHash} not found`);
  }
  return receipt;
}

/**
 * Check ETH balance
 * @param provider - Ethereum provider
 * @param address - Wallet address
 * @returns Balance in ETH
 */
export async function getBalance(
  provider: ethers.Provider,
  address: string
): Promise<string> {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Check ERC20 token balance
 * @param provider - Ethereum provider
 * @param tokenAddress - ERC20 token contract address
 * @param walletAddress - Wallet address to check
 * @returns Token balance
 */
export async function getTokenBalance(
  provider: ethers.Provider,
  tokenAddress: string,
  walletAddress: string
): Promise<bigint> {
  const abi = ['function balanceOf(address) view returns (uint256)'];
  const contract = new ethers.Contract(tokenAddress, abi, provider);
  const balance = await contract.balanceOf(walletAddress);
  return balance;
}

/**
 * Deploy a contract
 * @param wallet - Deployer wallet
 * @param abi - Contract ABI
 * @param bytecode - Contract bytecode
 * @param args - Constructor arguments
 * @returns Deployed contract instance
 */
export async function deployContract(
  wallet: ethers.Wallet,
  abi: any[],
  bytecode: string,
  args: any[] = []
): Promise<ethers.Contract> {
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  return contract;
}

/**
 * Get gas price estimate
 * @param provider - Ethereum provider
 * @returns Gas price in gwei
 */
export async function getGasPrice(provider: ethers.Provider): Promise<string> {
  const feeData = await provider.getFeeData();
  if (feeData.gasPrice) {
    return ethers.formatUnits(feeData.gasPrice, 'gwei');
  }
  throw new Error('Could not get gas price');
}

/**
 * Estimate gas for a transaction
 * @param provider - Ethereum provider
 * @param tx - Transaction object
 * @returns Gas estimate
 */
export async function estimateGas(
  provider: ethers.Provider,
  tx: ethers.TransactionRequest
): Promise<bigint> {
  return await provider.estimateGas(tx);
}

/**
 * Send ETH to an address
 * @param wallet - Sender wallet
 * @param to - Recipient address
 * @param amount - Amount in ETH
 * @returns Transaction hash
 */
export async function sendETH(
  wallet: ethers.Wallet,
  to: string,
  amount: string
): Promise<string> {
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(amount),
  });
  return tx.hash;
}

/**
 * Watch for events on a contract
 * @param contract - Contract instance
 * @param eventName - Event name to watch
 * @param filter - Event filter
 * @param callback - Callback function when event is emitted
 */
export function watchEvent(
  contract: ethers.Contract,
  eventName: string,
  filter: any = {},
  callback: (event: any) => void
): void {
  contract.on(eventName, (...args) => {
    const event = args[args.length - 1];
    callback(event);
  });
}

/**
 * Get transaction history
 * @param provider - Ethereum provider
 * @param address - Wallet address
 * @param startBlock - Starting block number
 * @param endBlock - Ending block number
 * @returns Array of transactions
 */
export async function getTransactionHistory(
  provider: ethers.Provider,
  address: string,
  startBlock?: number,
  endBlock?: number
): Promise<ethers.TransactionResponse[]> {
  const latestBlock = endBlock || await provider.getBlockNumber();
  const start = startBlock || latestBlock - 1000;
  
  const transactions: ethers.TransactionResponse[] = [];
  
  for (let i = start; i <= latestBlock; i++) {
    const block = await provider.getBlock(i, true);
    if (block && block.prefetchedTransactions) {
      const relevantTxs = block.prefetchedTransactions.filter(
        tx => tx.from === address || tx.to === address
      );
      transactions.push(...relevantTxs);
    }
  }
  
  return transactions;
}

/**
 * Mine a block (for local testing)
 * @param provider - JSON-RPC provider
 */
export async function mineBlock(provider: ethers.JsonRpcProvider): Promise<void> {
  await provider.send('evm_mine', []);
}

/**
 * Increase time (for local testing)
 * @param provider - JSON-RPC provider
 * @param seconds - Seconds to increase
 */
export async function increaseTime(
  provider: ethers.JsonRpcProvider,
  seconds: number
): Promise<void> {
  await provider.send('evm_increaseTime', [seconds]);
  await mineBlock(provider);
}

/**
 * Set account balance (for local testing with Hardhat)
 * @param provider - JSON-RPC provider
 * @param address - Account address
 * @param balance - New balance in ETH
 */
export async function setBalance(
  provider: ethers.JsonRpcProvider,
  address: string,
  balance: string
): Promise<void> {
  await provider.send('hardhat_setBalance', [
    address,
    ethers.parseEther(balance).toHexString(),
  ]);
}

/**
 * Impersonate account (for local testing with Hardhat)
 * @param provider - JSON-RPC provider
 * @param address - Address to impersonate
 */
export async function impersonateAccount(
  provider: ethers.JsonRpcProvider,
  address: string
): Promise<void> {
  await provider.send('hardhat_impersonateAccount', [address]);
}

/**
 * Stop impersonating account
 * @param provider - JSON-RPC provider
 * @param address - Address to stop impersonating
 */
export async function stopImpersonatingAccount(
  provider: ethers.JsonRpcProvider,
  address: string
): Promise<void> {
  await provider.send('hardhat_stopImpersonatingAccount', [address]);
}
