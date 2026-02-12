# Web3 Security Automation Framework

<p align="center">
  <a href="https://playwright.dev/">
    <img src="https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white" alt="Playwright" />
  </a>
  <a href="https://metamask.io/">
    <img src="https://img.shields.io/badge/MetaMask-E2761B?style=for-the-badge&logo=MetaMask&logoColor=white" alt="MetaMask" />
  </a>
  <a href="https://ethereum.org/">
    <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white" alt="Ethereum" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://hardhat.org/">
    <img src="https://img.shields.io/badge/Hardhat-FFF100?style=for-the-badge&logo=Hardhat&logoColor=black" alt="Hardhat" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/Mendes1982/web3-security-automation/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/Mendes1982/web3-security-automation/ci.yml?branch=main&style=flat-square&label=GitHub%20Actions&logo=github" alt="GitHub Actions" />
  </a>
  <a href="https://circleci.com/gh/Mendes1982/web3-security-automation">
    <img src="https://img.shields.io/circleci/build/github/Mendes1982/web3-security-automation/main?style=flat-square&label=CircleCI&logo=circleci" alt="CircleCI" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" />
  </a>
</p>

---

## 🚀 Overview

**Web3 Security Automation** is a comprehensive testing framework designed specifically for decentralized applications (DApps) on the Ethereum blockchain. Built with Playwright and TypeScript, it provides robust end-to-end testing capabilities with native MetaMask wallet integration.

### ✨ Key Features

- 🔗 **Native MetaMask Integration** - Seamless wallet connection and transaction signing
- 🔒 **Smart Contract Testing** - Automated interaction with Solidity contracts
- 🌐 **Multi-Network Support** - Test on Mainnet, Testnet, or local Hardhat network
- 📊 **Security Scanning** - Automated vulnerability detection for Web3 applications
- 🐳 **Docker Support** - Containerized testing environment for CI/CD
- 📱 **Mobile Responsive** - Test DApps across different viewport sizes
- 🎯 **Parallel Execution** - Run tests concurrently for faster feedback
- 📸 **Visual Regression** - Built-in screenshot comparison for UI integrity

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Mendes1982/web3-security-automation.git
cd web3-security-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Setup environment variables
cp .env.example .env
```

---

## 🛠️ Configuration

Create a `.env` file with the following variables:

```env
# Network Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
LOCAL_RPC_URL=http://127.0.0.1:8545

# Wallet Configuration (for testing only - use test wallets)
TEST_WALLET_PRIVATE_KEY=0x...
TEST_WALLET_MNEMONIC=word1 word2 word3...

# Contract Addresses
USDC_CONTRACT=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
DAI_CONTRACT=0x6B175474E89094C44Da98b954EedeAC495271d0F

# DApp URLs
APP_URL=https://your-dapp.com
TESTNET_URL=https://testnet.your-dapp.com

# CI/CD
CI=true
```

---

## 🧪 Usage

### Run All Tests

```bash
npm test
```

### Run Tests in Headed Mode (with browser UI)

```bash
npm run test:headed
```

### Run Tests on Specific Browser

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run Tests in Docker

```bash
docker build -t web3-tests .
docker run --rm -v $(pwd)/test-results:/app/test-results web3-tests
```

### Debug Mode

```bash
npm run test:debug
```

### Generate Test Report

```bash
npm run report
```

---

## 📁 Project Structure

```
web3-security-automation/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── fixtures/
│   ├── dapp-context.ts         # DApp test context fixtures
│   ├── metamask-setup.ts       # MetaMask initialization
│   └── wallet-fixtures.ts      # Wallet-related fixtures
├── pages/
│   ├── base.page.ts            # Base page object
│   ├── metamask.page.ts        # MetaMask page object
│   └── uniswap.page.ts         # Example DApp page object
├── tests/
│   ├── e2e/
│   │   ├── wallet-connection.spec.ts
│   │   ├── token-swap.spec.ts
│   │   └── nft-minting.spec.ts
│   ├── security/
│   │   ├── contract-reentrancy.spec.ts
│   │   └── access-control.spec.ts
│   └── performance/
│       └── load-testing.spec.ts
├── utils/
│   ├── blockchain.ts           # Blockchain interaction utilities
│   ├── contract-abi.ts         # Smart contract ABIs
│   ├── rpc-client.ts           # RPC client wrapper
│   └── test-helpers.ts         # Test utilities
├── playwright.config.ts        # Playwright configuration
├── Dockerfile                  # Docker configuration
├── package.json
└── README.md
```

---

## 🎨 Example Test

```typescript
import { test, expect } from '../fixtures/dapp-context';
import { MetaMaskPage } from '../pages/metamask.page';
import { UniswapPage } from '../pages/uniswap.page';

test('Complete token swap workflow', async ({ page, context }) => {
  // Initialize MetaMask
  const metamask = new MetaMaskPage(context);
  await metamask.connect();
  
  // Navigate to DApp
  const uniswap = new UniswapPage(page);
  await uniswap.goto();
  
  // Connect wallet
  await uniswap.connectWallet();
  await metamask.approveConnection();
  
  // Perform swap
  await uniswap.selectToken('ETH', 'USDC');
  await uniswap.enterAmount('0.1');
  await uniswap.swap();
  
  // Confirm transaction in MetaMask
  await metamask.confirmTransaction();
  
  // Verify success
  await expect(uniswap.successMessage).toBeVisible();
});
```

---

## 🔐 Security Testing Features

### Contract Vulnerability Detection

- **Reentrancy Attack Prevention** - Tests for recursive call vulnerabilities
- **Access Control Validation** - Verifies proper permission settings
- **Integer Overflow/Underflow** - Checks for arithmetic vulnerabilities
- **Front-running Protection** - Simulates MEV attack scenarios
- **Gas Limit Testing** - Validates gas optimization and limit handling

### Transaction Security

- **Signature Validation** - Ensures proper message signing
- **Nonce Management** - Tests transaction ordering and replay protection
- **Event Emission Verification** - Confirms contract events are properly emitted

---

## 🐳 Docker Usage

### Build Image

```bash
docker build -t web3-security-automation .
```

### Run Tests

```bash
docker run --rm \
  -e ETHEREUM_RPC_URL=$ETHEREUM_RPC_URL \
  -e TEST_WALLET_PRIVATE_KEY=$TEST_WALLET_PRIVATE_KEY \
  -v $(pwd)/test-results:/app/test-results \
  web3-security-automation
```

### Run with Docker Compose

```bash
docker-compose up --abort-on-container-exit
```

---

## 📊 CI/CD Integration

The framework includes a pre-configured GitHub Actions workflow that:

- Runs tests on every push and pull request
- Tests across multiple browsers (Chromium, Firefox, WebKit)
- Generates and uploads test reports
- Publishes test results as PR comments
- Triggers security scans on schedule

See `.github/workflows/ci.yml` for full configuration.

---

## 🎯 Best Practices

1. **Always use test wallets** - Never use production wallets for testing
2. **Mock external dependencies** - Use local blockchain for deterministic tests
3. **Isolate test data** - Each test should have independent state
4. **Monitor gas costs** - Track transaction costs in test reports
5. **Test edge cases** - Include boundary conditions and error scenarios
6. **Use testnets first** - Validate on testnets before mainnet testing

---

## 📝 API Documentation

### MetaMaskPage

```typescript
class MetaMaskPage {
  async connect(): Promise<void>
  async approveConnection(): Promise<void>
  async rejectConnection(): Promise<void>
  async confirmTransaction(options?: TransactionOptions): Promise<void>
  async rejectTransaction(): Promise<void>
  async switchNetwork(network: string): Promise<void>
  async addNetwork(config: NetworkConfig): Promise<void>
  async importAccount(privateKey: string): Promise<void>
}
```

### Blockchain Utilities

```typescript
// Deploy contract
const contract = await deployContract('MyContract', [arg1, arg2]);

// Send transaction
const tx = await sendTransaction({
  to: '0x...',
  value: parseEther('1.0'),
  data: '0x...'
});

// Call contract method
const result = await callContract(contract, 'balanceOf', [address]);
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Ricardo Silva**
- 🔗 LinkedIn: [linkedin.com/in/ricardo-silva](https://linkedin.com/in/ricardo-silva)
- 🐙 GitHub: [@Mendes1982](https://github.com/Mendes1982)
- 📧 Email: tvmax360ofc@gmail.com

---

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - Web testing framework
- [MetaMask](https://metamask.io/) - Web3 wallet
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [ethers.js](https://docs.ethers.io/) - Ethereum library

---

<p align="center">
  Built with ❤️ for the Web3 community
</p>
