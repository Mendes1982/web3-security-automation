import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

/**
 * ERC20 Token Contract ABI (simplified)
 */
export const ERC20_ABI = [
  // Read-only functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // Write functions
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint amount) returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',
  'event Approval(address indexed owner, address indexed spender, uint256 amount)',
];

/**
 * Simple Storage Contract ABI
 * Used for testing basic smart contract interactions
 */
export const SIMPLE_STORAGE_ABI = [
  'function set(uint256 x) public',
  'function get() public view returns (uint256)',
  'event ValueChanged(uint256 oldValue, uint256 newValue)',
];

/**
 * Load contract ABI from file
 * @param contractName - Name of the contract
 * @returns Contract ABI
 */
export function loadContractABI(contractName: string): any[] {
  const abiPath = path.join(__dirname, '..', 'contracts', 'artifacts', `${contractName}.json`);
  
  if (!fs.existsSync(abiPath)) {
    throw new Error(`Contract ABI not found: ${abiPath}`);
  }
  
  const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  return contractJson.abi;
}

/**
 * Common token contract addresses (mainnet)
 */
export const TOKEN_CONTRACTS = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
};

/**
 * Test contract addresses (Goerli testnet)
 */
export const TESTNET_CONTRACTS = {
  USDC: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F', // Goerli USDC
  DAI: '0x11fE4B6AE13d2a6055C8D9cD65DfE1CA7b064Ee2',   // Goerli DAI
  WETH: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',  // Goerli WETH
};
