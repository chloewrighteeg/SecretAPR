# SecretAPR

[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/solidity-0.8.27-blue)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-green)](https://nodejs.org/)

A privacy-preserving staking platform built on Fully Homomorphic Encryption (FHE), enabling confidential DeFi operations while maintaining transparent and verifiable reward distributions.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Advantages](#advantages)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Problems Solved](#problems-solved)
- [Smart Contracts](#smart-contracts)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

SecretAPR is a decentralized staking protocol that leverages **Fully Homomorphic Encryption (FHE)** to provide privacy-preserving financial operations. Users can stake ETH and earn encrypted token rewards while maintaining complete confidentiality of their balances. The platform combines the transparency requirements of blockchain technology with the privacy needs of modern DeFi users.

### What Makes SecretAPR Unique?

- **Confidential Balances**: Token balances are encrypted using FHE, ensuring only the owner can view their holdings
- **Transparent Rewards**: Staking mechanics and APR calculations are fully on-chain and verifiable
- **Zero-Knowledge Privacy**: Leverages cutting-edge cryptography from Zama's FHEVM protocol
- **ERC-7984 Standard**: Implements the latest confidential token standard from OpenZeppelin
- **Gas-Efficient**: Optimized smart contracts with minimal computational overhead

## Key Features

### 1. Privacy-Preserving Token System

SecretAPR uses the **ERC-7984** confidential token standard, which provides:

- Encrypted balance storage using homomorphic encryption
- Selective disclosure: users can prove ownership without revealing amounts
- Encrypted transfers while maintaining on-chain verifiability
- Compatibility with existing Ethereum infrastructure

### 2. Flexible Staking Mechanism

The staking contract offers:

- **Instant Staking**: Stake ETH and start earning immediately
- **Continuous Compounding**: Interest accrues every second, not in discrete periods
- **Flexible Withdrawals**: Unstake any amount at any time without lock-up periods
- **Automatic Claims**: Interest is automatically claimed during stake/unstake operations
- **Transparent APR**: 1 billion tokens per ETH per day (~365 billion tokens per ETH per year)

### 3. Non-Custodial Architecture

- Users maintain full control of their assets
- No intermediaries or trusted third parties
- All operations are permissionless and censorship-resistant
- ReentrancyGuard protection on all state-changing functions

## Advantages

### For Users

1. **Financial Privacy**
   - Token balances remain confidential, preventing front-running and MEV attacks
   - No public exposure of wealth or trading patterns
   - Selective disclosure allows compliance without sacrificing privacy

2. **Competitive Returns**
   - Fixed, predictable APR calculated per-second
   - No dilution from inflationary tokenomics
   - Gas-efficient claim mechanisms reduce overhead costs

3. **Flexibility & Control**
   - No minimum staking amounts (beyond gas costs)
   - No lock-up periods or withdrawal penalties
   - Compound rewards by re-staking claimed tokens

4. **Security**
   - Battle-tested OpenZeppelin contracts as foundation
   - Comprehensive test coverage
   - ReentrancyGuard protection against common attack vectors

### For the Ecosystem

1. **Privacy Infrastructure**
   - Demonstrates practical FHE implementation in DeFi
   - Open-source reference implementation for developers
   - Contributes to privacy-preserving blockchain research

2. **Regulatory Compliance**
   - Balance privacy with potential regulatory requirements
   - Enables selective disclosure for compliance purposes
   - Future-proof architecture for evolving regulations

3. **Scalability**
   - Efficient FHE operations minimize gas costs
   - Designed for Layer 2 and rollup deployment
   - Optimized for high-throughput environments

## Architecture

SecretAPR consists of two primary smart contracts:

```
┌─────────────────────────────────────────────────────────┐
│                    SecretAPR System                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │  ERC7984Coin     │         │ SecretAPRStaking │    │
│  │  (Token)         │◄────────│  (Staking Pool)  │    │
│  │                  │  mints  │                  │    │
│  │  - Encrypted     │         │  - ETH Deposits  │    │
│  │    Balances      │         │  - Reward Calc   │    │
│  │  - FHE Ops       │         │  - Interest      │    │
│  │  - Minter Role   │         │    Distribution  │    │
│  └──────────────────┘         └──────────────────┘    │
│           │                            │               │
│           │                            │               │
│  ┌────────▼────────────────────────────▼─────────┐    │
│  │         Zama FHEVM Protocol                   │    │
│  │  - Homomorphic Encryption                     │    │
│  │  - Secure Computation                         │    │
│  │  - Key Management                             │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Contract Interaction Flow

```
User Staking Flow:
1. User calls stake() with ETH
2. SecretAPRStaking records stake amount and timestamp
3. Interest accrues continuously based on time elapsed
4. User calls claimInterest() or unstake()
5. SecretAPRStaking calculates pending rewards
6. ERC7984Coin mints encrypted tokens to user
7. User balance remains confidential, only accessible by owner
```

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | 0.8.27 | Smart contract language with Cancun EVM support |
| **FHEVM** | 0.8.0 | Zama's Fully Homomorphic Encryption library |
| **OpenZeppelin** | - | Industry-standard smart contract libraries |
| **Hardhat** | 2.26.0 | Development environment and testing framework |
| **TypeScript** | 5.8.3 | Type-safe development and testing |
| **Ethers.js** | 6.15.0 | Ethereum interaction library |

### Key Dependencies

#### Production

- `@fhevm/solidity`: FHE operations in Solidity
- `@openzeppelin/confidential-contracts`: ERC-7984 implementation
- `@openzeppelin/contracts`: Security and utility contracts
- `@zama-fhe/oracle-solidity`: FHE oracle integration

#### Development

- `@fhevm/hardhat-plugin`: FHEVM testing utilities
- `hardhat-deploy`: Deployment management
- `@typechain/hardhat`: TypeScript contract bindings
- `hardhat-gas-reporter`: Gas optimization analysis
- `solidity-coverage`: Code coverage reporting

### Cryptographic Primitives

- **FHE Scheme**: TFHE (Torus Fully Homomorphic Encryption)
- **Encryption Type**: euint64 (64-bit encrypted integers)
- **Key Management**: Zama's decentralized key infrastructure
- **Access Control**: FHE.allow() for selective decryption rights

## Problems Solved

### 1. Privacy Paradox in Public Blockchains

**Problem**: Traditional blockchains expose all transaction details, including balances, making financial privacy impossible.

**Solution**: SecretAPR uses FHE to encrypt token balances while maintaining blockchain verifiability. Users can transact and stake without revealing their holdings to the public.

**Impact**:
- Prevents whale tracking and front-running
- Protects users from targeted attacks based on wealth
- Enables institutional participation without public exposure

### 2. MEV (Miner Extractable Value) Exploitation

**Problem**: Public transaction mempool allows miners/validators to extract value through front-running, sandwich attacks, and other MEV strategies.

**Solution**: Confidential balances prevent attackers from profiling users or identifying profitable targets.

**Impact**:
- Reduces user losses to MEV attacks
- Creates fairer market conditions
- Encourages broader DeFi participation

### 3. Complex Reward Distribution

**Problem**: Many staking protocols use complex snapshot mechanisms or batch processing, leading to gas inefficiency and delayed rewards.

**Solution**: SecretAPR implements continuous per-second interest accrual with on-demand claiming, providing:
- Precise reward calculations
- Gas-efficient single-operation claims
- No trust in third-party reward distributors

**Impact**:
- Predictable and fair reward distribution
- Lower operational costs
- Improved user experience

### 4. Privacy vs. Compliance Trade-off

**Problem**: Complete anonymity conflicts with regulatory requirements, while full transparency sacrifices user privacy.

**Solution**: FHE enables selective disclosure where users can prove properties about encrypted data (e.g., balance > threshold) without revealing the exact value.

**Impact**:
- Compliance-friendly privacy
- Future-proof for evolving regulations
- Bridges DeFi and traditional finance

### 5. Liquidity Fragmentation

**Problem**: Privacy-preserving protocols often use separate infrastructure, fragmenting liquidity from mainstream DeFi.

**Solution**: ERC-7984 standard compatibility ensures integration with existing DeFi protocols and infrastructure.

**Impact**:
- Interoperability with existing DEXs and lending protocols
- Unified liquidity pools
- Easier adoption for existing DeFi users

## Smart Contracts

### ERC7984Coin.sol

The confidential token implementation following the ERC-7984 standard.

**Key Features**:
- Encrypted balance storage using `euint64` type
- Minter role for controlled token issuance
- Owner-controlled minter assignment
- FHE-based transfer operations

**Important Functions**:

```solidity
function mint(address to, uint64 amount) external
```
Mints encrypted tokens to specified address (only callable by minter contract).

```solidity
function setMinter(address newMinter) external onlyOwner
```
Updates the authorized minter contract.

**Security Measures**:
- `onlyOwner` modifier for minter updates
- `UnauthorizedMinter` error prevents unauthorized minting
- `InvalidMinter` prevents setting zero address as minter

### SecretAPRStaking.sol

The core staking logic and reward distribution contract.

**Key Features**:
- ETH staking with instant activation
- Continuous per-second interest accrual
- Automatic interest settlement on stake/unstake
- Reentrancy protection on all state-changing functions

**Important Functions**:

```solidity
function stake() external payable nonReentrant
```
Deposits ETH and begins earning interest immediately.

```solidity
function claimInterest() external nonReentrant returns (uint256 claimed)
```
Claims accrued interest as encrypted tokens.

```solidity
function unstake(uint256 amount) external nonReentrant
```
Withdraws staked ETH and automatically claims pending interest.

```solidity
function getStake(address user) external view returns (...)
```
Returns complete staking information for a user (amount, timestamps, rewards).

```solidity
function pendingInterest(address user) external view returns (uint256)
```
Calculates currently claimable interest without modifying state.

**Reward Formula**:
```
rewards = (stakedAmount * timeElapsed * TOKENS_PER_ETH_PER_DAY) / SECONDS_PER_DAY
```

Where:
- `TOKENS_PER_ETH_PER_DAY = 1,000,000,000` (1 billion tokens)
- `SECONDS_PER_DAY = 86,400`
- Interest compounds continuously

**Security Measures**:
- `ReentrancyGuard` on all external functions
- Checks-Effects-Interactions pattern
- Safe math operations using OpenZeppelin's Math library
- Custom errors for gas-efficient reverts

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/SecretAPR.git
   cd SecretAPR
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   # Private key for deployment (without 0x prefix)
   PRIVATE_KEY=your_private_key_here

   # Infura API key for network access
   INFURA_API_KEY=your_infura_api_key

   # Etherscan API key for contract verification
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

   Alternatively, use Hardhat's secure variable storage:

   ```bash
   npx hardhat vars set PRIVATE_KEY
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

4. **Compile contracts**

   ```bash
   npm run compile
   ```

   This will:
   - Compile all Solidity contracts
   - Generate TypeScript bindings with TypeChain
   - Create artifacts in the `artifacts/` directory

## Usage

### Local Development

1. **Start a local FHEVM node**

   ```bash
   npm run chain
   ```

   This starts a Hardhat node with FHEVM support on `http://localhost:8545`.

2. **Deploy contracts to local network**

   In a new terminal:

   ```bash
   npm run deploy:localhost
   ```

3. **Interact with contracts**

   Use Hardhat tasks to interact with deployed contracts:

   ```bash
   # Example: Get stake information
   npx hardhat stake:info --address <USER_ADDRESS> --network localhost
   ```

### Testnet Deployment

Deploy to Sepolia testnet:

```bash
npm run deploy:sepolia
```

Verify contracts on Etherscan:

```bash
npm run verify:sepolia
```

### Contract Interaction Examples

#### Staking ETH

```typescript
import { ethers } from "hardhat";

const staking = await ethers.getContractAt("SecretAPRStaking", STAKING_ADDRESS);

// Stake 1 ETH
const tx = await staking.stake({ value: ethers.parseEther("1.0") });
await tx.wait();
```

#### Claiming Interest

```typescript
// Check pending interest
const pending = await staking.pendingInterest(userAddress);
console.log(`Pending interest: ${pending} tokens`);

// Claim interest
const claimTx = await staking.claimInterest();
await claimTx.wait();
```

#### Unstaking

```typescript
// Unstake 0.5 ETH
const unstakeTx = await staking.unstake(ethers.parseEther("0.5"));
await unstakeTx.wait();
```

#### Checking Encrypted Balance

```typescript
import { fhevm } from "hardhat";

const coin = await ethers.getContractAt("ERC7984Coin", COIN_ADDRESS);

// Get encrypted balance
const encryptedBalance = await coin.confidentialBalanceOf(userAddress);

// Decrypt (only works for the account owner)
const clearBalance = await fhevm.userDecryptEuint(
  FhevmType.euint64,
  encryptedBalance,
  coinAddress,
  signer
);

console.log(`Decrypted balance: ${clearBalance}`);
```

## Testing

SecretAPR includes comprehensive test coverage for all contract functionality.

### Run All Tests

```bash
npm run test
```

### Test Coverage

Generate a coverage report:

```bash
npm run coverage
```

Coverage report will be available in `coverage/index.html`.

### Test on Sepolia

Test deployed contracts on Sepolia testnet:

```bash
npm run test:sepolia
```

### Test Structure

```
test/
└── SecretAPRStaking.ts    # Comprehensive staking tests
    ├── Staking deposits
    ├── Interest accrual
    ├── Reward claiming
    ├── Unstaking
    ├── Edge cases
    └── Error conditions
```

### Key Test Cases

- ✅ Stake tracking and storage
- ✅ Interest accrual over time (1 day period)
- ✅ Encrypted token minting
- ✅ Partial unstaking with settlement
- ✅ Zero amount validation
- ✅ No-stake error handling
- ✅ Reentrancy protection
- ✅ Multiple user interactions

## Deployment

### Network Configuration

SecretAPR supports deployment to:

- **Hardhat**: Local development network
- **Anvil**: Foundry's local network
- **Sepolia**: Ethereum testnet (primary)
- **Custom Networks**: Configure in `hardhat.config.ts`

### Deployment Process

The deployment script (`deploy/deploy.ts`) performs the following:

1. Deploys `ERC7984Coin` contract
2. Deploys `SecretAPRStaking` contract with coin address
3. Sets staking contract as the authorized minter
4. Logs deployment addresses for verification

### Deployment Commands

```bash
# Local deployment
npm run deploy:localhost

# Sepolia testnet
npm run deploy:sepolia

# Custom network
npx hardhat deploy --network <network-name>
```

### Post-Deployment Verification

After deployment, verify contracts on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Deployment Addresses

Record deployed addresses for integration:

```typescript
// Example deployment output
ERC7984Coin deployed at: 0x1234...
SecretAPRStaking deployed at: 0x5678...
```

## Security Considerations

### Auditing Status

⚠️ **Important**: This project is currently unaudited. Do not use in production with real funds without a professional security audit.

### Known Considerations

1. **FHE Security Assumptions**
   - Relies on Zama's FHEVM security guarantees
   - Encryption key management handled by protocol
   - Regular security updates from Zama team required

2. **Smart Contract Security**
   - Uses OpenZeppelin's battle-tested contracts
   - ReentrancyGuard on all state-changing functions
   - Follows checks-effects-interactions pattern
   - Custom errors for gas optimization

3. **Economic Security**
   - Fixed reward rate may need adjustment based on ETH price
   - No reward pool depletion risk (mint-on-claim model)
   - Consider implementing circuit breakers for production

4. **Upgrade Considerations**
   - Current contracts are not upgradeable
   - Future versions should consider proxy patterns
   - Migration strategy needed for contract updates

### Best Practices for Users

- Never share private keys or mnemonic phrases
- Verify contract addresses before interacting
- Start with small test amounts on testnet
- Understand that decryption requires your private key
- Be aware of gas costs for FHE operations

### Reporting Security Issues

If you discover a security vulnerability, please email security@example.com. Do not open public issues for security concerns.

## Roadmap

### Phase 1: Foundation (Current)

- ✅ Core staking mechanism
- ✅ ERC-7984 confidential token implementation
- ✅ Basic testing suite
- ✅ Local deployment support
- ✅ Sepolia testnet deployment

### Phase 2: Enhancement (Q2 2025)

- 🔄 Comprehensive security audit
- 🔄 Enhanced testing and formal verification
- 🔄 Gas optimization for FHE operations
- 🔄 Frontend dApp development
- 🔄 Documentation expansion
- 🔄 Mainnet deployment preparation

### Phase 3: Advanced Features (Q3 2025)

- 📋 Multi-token staking support
  - Accept various ERC-20 tokens as stake
  - Dynamic APR based on token type
  - Cross-token reward mechanisms

- 📋 Liquidity mining integration
  - LP token staking
  - Dual reward systems
  - Boosted rewards for long-term stakers

- 📋 Governance implementation
  - Token-weighted voting (using encrypted balances)
  - DAO treasury management
  - Community-driven parameter updates

- 📋 Reward flexibility
  - Variable APR based on total TVL
  - Tiered reward structures
  - Penalty-free early withdrawal options

### Phase 4: Ecosystem Integration (Q4 2025)

- 📋 Cross-chain deployment
  - Layer 2 integration (Arbitrum, Optimism)
  - Bridge protocols for cross-chain staking
  - Multi-chain reward aggregation

- 📋 DeFi composability
  - Integration with privacy-preserving DEXs
  - Confidential lending protocols
  - Yield aggregator partnerships

- 📋 Advanced privacy features
  - Anonymous staking pools
  - Privacy-preserving analytics
  - Selective disclosure for compliance

- 📋 NFT integration
  - Stake NFTs for rewards
  - NFT-based reward multipliers
  - Confidential NFT ownership

### Phase 5: Enterprise & Compliance (2026)

- 📋 Institutional features
  - Multi-signature support for encrypted operations
  - Advanced access controls
  - Audit trail generation

- 📋 Regulatory compliance
  - Selective disclosure mechanisms
  - Regulatory reporting tools
  - KYC/AML integration options

- 📋 Scalability improvements
  - ZK-rollup integration
  - Optimistic rollup deployment
  - State channel support

### Long-term Vision

- Build the leading privacy-preserving DeFi protocol
- Establish industry standards for confidential smart contracts
- Foster an ecosystem of privacy-focused dApps
- Contribute to blockchain privacy research and development
- Bridge traditional finance with confidential DeFi

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Code Contributions**
   - Bug fixes
   - Feature implementations
   - Gas optimizations
   - Test coverage improvements

2. **Documentation**
   - Tutorial creation
   - Translation
   - API documentation
   - Usage examples

3. **Testing & QA**
   - Bug reports
   - Test case suggestions
   - Security analysis
   - Performance benchmarking

4. **Community Support**
   - Answer questions in Discord/Telegram
   - Review pull requests
   - Share use cases and feedback

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow Solidity style guide
- Maintain test coverage above 90%
- Document all public functions with NatSpec
- Use TypeScript for all scripts and tests
- Run linting before commits: `npm run lint`

### Testing Requirements

All PRs must include:
- Unit tests for new functionality
- Integration tests where applicable
- Gas usage analysis
- Security considerations documentation

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

See the [LICENSE](LICENSE) file for full details.

### Key License Points

- ✅ Commercial use permitted
- ✅ Modification permitted
- ✅ Distribution permitted
- ✅ Private use permitted
- ❌ No patent rights granted
- ⚠️ No warranty provided
- ⚠️ Liability limitations apply

## Support

### Documentation

- **FHEVM Documentation**: [docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **ERC-7984 Standard**: [OpenZeppelin Confidential Contracts](https://github.com/OpenZeppelin/openzeppelin-confidential-contracts)
- **Hardhat Docs**: [hardhat.org](https://hardhat.org)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/SecretAPR/issues)
- **Discussions**: [Join the conversation](https://github.com/yourusername/SecretAPR/discussions)
- **Discord**: [Coming soon]
- **Twitter**: [@SecretAPR](https://twitter.com/SecretAPR) (example)

### Getting Help

1. Check existing [documentation](#documentation)
2. Search [GitHub Issues](https://github.com/yourusername/SecretAPR/issues)
3. Ask in [GitHub Discussions](https://github.com/yourusername/SecretAPR/discussions)
4. Join our community Discord

### Related Projects

- **Zama FHEVM**: [github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)
- **OpenZeppelin Confidential Contracts**: [github.com/OpenZeppelin/openzeppelin-confidential-contracts](https://github.com/OpenZeppelin/openzeppelin-confidential-contracts)
- **TFHE-rs**: [github.com/zama-ai/tfhe-rs](https://github.com/zama-ai/tfhe-rs)

---

## Acknowledgments

Built with ❤️ using:

- [Zama](https://zama.ai) - FHEVM protocol and cryptographic primitives
- [OpenZeppelin](https://openzeppelin.com) - Secure smart contract libraries
- [Hardhat](https://hardhat.org) - Ethereum development environment
- [Ethers.js](https://docs.ethers.org) - Ethereum library

## Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk. The authors and contributors are not responsible for any losses incurred through the use of this software. Always conduct your own research and security audits before using in production.

**This is experimental software. Do not use with real funds without a professional security audit.**

---

**SecretAPR** - Privacy-Preserving Staking for the Future of DeFi
