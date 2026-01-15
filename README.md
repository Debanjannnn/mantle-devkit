# Mantle DevKit

**The First Complete Developer Toolkit for Mantle Network**

Payments and DeFi with a Few Lines of Code

---

## The Problem

Building production-grade blockchain applications today suffers from three critical challenges:

1. **Fragmented Infrastructure**: Developers must integrate multiple SDKs, understand dozens of smart contract ABIs, and handle protocol-specific quirks across DEXs, lending platforms, and cross-chain bridges. A simple swap operation can require 500+ lines of boilerplate.

2. **API Monetization Complexity**: Web3 developers have no standardized way to accept crypto payments for API access. Traditional payment processors charge 3-5% fees, require lengthy onboarding, and don't support native tokens. Building custom payment logic means maintaining escrow contracts, handling refunds, and managing disputes.

3. **Protocol Isolation**: Each DeFi protocol operates independently. Developers must learn Aave for lending, Uniswap for swaps, and Chainlink for oracles. There's no unified interface, no consistent error handling, and no standardized transaction patterns.

Mantle DevKit solves this by providing two production-ready SDKs:

- **Agent Kit**: Unified interface for 9+ DeFi protocols through a single class instance
- **x402 SDK**: HTTP 402 Payment Required protocol implementation for API monetization with sub-cent gas costs

---

## Why Mantle Network

Mantle's modular L2 architecture is essential for DevKit's capabilities:

**Ultra-Low Gas Fees**: Transaction costs under $0.001 make micropayments economically viable. x402 payments that would cost $2-5 on Ethereum mainnet cost fractions of a cent on Mantle.

**Fast Finality**: Block confirmation in seconds enables real-time payment verification. API requests don't stall waiting for blockchain confirmations.

**EVM Compatibility**: Deploy existing Solidity contracts without modification. Use familiar tools like Hardhat, Foundry, and Viem.

**Native Yield**: MNT and mETH tokens earn native staking yield, allowing payment tokens to appreciate while held.

**Ecosystem Depth**: Mature DeFi ecosystem with established protocols (Agni, Lendle, Merchant Moe) provides reliable liquidity for swaps and lending operations.

---

## Technical Architecture

### On-Chain Components (Mantle Network)

**Mainnet (Chain ID: 5000)**

| Protocol | Contract Type | Address |
|----------|---------------|---------|
| Agni Finance | SwapRouter | `0x319B69888b0d11cEC22caA5034e25FfFBDc88421` |
| Agni Finance | Factory | `0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035` |
| Merchant Moe | LBRouter | `0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a` |
| Uniswap V3 | SwapRouter | `0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45` |
| Lendle | LendingPool | `0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3` |
| Lendle | DataProvider | `0x552b9e4bae485C4B7F540777d7D25614CdB84773` |
| Pyth Network | Oracle | `0xA2aa501b19aff244D90cc15a4Cf739D2725B5729` |
| mETH Protocol | Token | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` |

**Token Addresses (Mainnet)**

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9` | 6 |
| USDT | `0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE` | 6 |
| WMNT | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | 18 |
| mETH | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` | 18 |
| WETH | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` | 18 |

**Testnet (Chain ID: 5003)**

| Protocol | Contract Type | Address |
|----------|---------------|---------|
| Pyth Network | Oracle | `0x98046Bd286715D3B0BC227Dd7a956b83D8978603` |
| PikePerps | PerpetualTrading | `0x8081b646f349c049f2d5e8a400057d411dd657bd` |
| PikePerps | BondingCurveMarket | `0x93b268325A9862645c82b32229f3B52264750Ca2` |

### Off-Chain Infrastructure

**Agent Kit SDK**: TypeScript library providing protocol abstraction layer. Handles ABI encoding, transaction simulation, gas estimation, and response parsing for all integrated protocols.

**x402 SDK**: Middleware for Express, Hono, and Next.js that intercepts requests, validates payments, and routes to protected endpoints. Includes React components for client-side payment flows.

**MCP Server**: Model Context Protocol server enabling Claude AI and other LLMs to interact with Mantle protocols through natural language.

---

## Product Features

- **Unified DeFi Interface**: Single SDK to access 9+ protocols including Agni Finance, Lendle, Merchant Moe, and Pyth Network for swaps, lending, staking, and price feeds.
- **API Monetization with x402**: Protect any endpoint with crypto payments using HTTP 402 standard—includes server middleware and React components for seamless integration.
- **One-Click Token Deployment**: Deploy ERC20 tokens and NFT collections on Mantle with simple function calls, no contract development required.
- **AI-Ready MCP Server**: Enable Claude and other LLMs to execute blockchain operations through natural language for autonomous agent workflows.

---

## NPM Packages

| Package | Version | Description | Link |
|---------|---------|-------------|------|
| `mantle-agent-kit-sdk` | 1.2.0 | DeFi protocol integration SDK | [npm](https://www.npmjs.com/package/mantle-agent-kit-sdk) |
| `x402-mantle-sdk` | 0.2.8 | HTTP 402 payment middleware | [npm](https://www.npmjs.com/package/x402-mantle-sdk) |
| `create-mantle-devkit-app` | - | CLI scaffolding tool | [npm](https://www.npmjs.com/package/create-mantle-devkit-app) |

---

## Quick Start

**Option 1: CLI Scaffolding**

```bash
npx create-mantle-devkit-app my-app
```

Select from templates:
- Agent Kit (DeFi swap interface)
- x402 Fullstack (Next.js + API)
- x402 Backend (Hono/Express server)

**Option 2: Manual Installation**

```bash
# For DeFi operations
npm install mantle-agent-kit-sdk

# For API monetization
npm install x402-mantle-sdk
```

**Environment Configuration**

```env
# Agent Kit
APP_ID=your_app_id_here

# x402 SDK
X402_APP_ID=your-app-id-here
X402_PLATFORM_URL=https://mantle-devkit.vercel.app

# OKX DEX (optional)
OKX_API_KEY=...
OKX_SECRET_KEY=...
OKX_API_PASSPHRASE=...
```

---

## Network Configuration

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Mantle Mainnet | 5000 | https://rpc.mantle.xyz | https://explorer.mantle.xyz |
| Mantle Sepolia | 5003 | https://rpc.sepolia.mantle.xyz | https://explorer.sepolia.mantle.xyz |

---

## Economic Model

**For API Providers**
- Set custom prices per endpoint (denominated in any supported token)
- Receive payments directly to wallet (minus 0.5% platform fee)
- Real-time revenue analytics via Observatory dashboard

**For Developers**
- Free and open source SDKs
- No vendor lock-in (self-host or use managed infrastructure)
- Pay only network gas fees (typically under $0.001)

**Pricing Tiers**
- Open Source: Free forever
- Observatory Cloud: $29/month (coming soon) - managed analytics and monitoring
- Enterprise: Custom pricing - dedicated support and SLAs

---

## Market Opportunity

**Target Users**
- DeFi protocol developers building on Mantle
- API providers seeking crypto-native monetization
- AI agent builders requiring blockchain capabilities
- SaaS companies exploring micropayment models

**Competitive Advantages**
- Only complete developer toolkit purpose-built for Mantle Network
- Sub-cent transaction costs enable micropayment use cases impossible on other L2s
- Unified interface reduces integration time from weeks to hours
- HTTP 402 standard provides framework-agnostic payment protocol

---

## Progress During Hackathon

- Fully functional Agent Kit SDK with 9+ DeFi protocol integrations (Agni, Lendle, Merchant Moe, Pyth, etc.)
- HTTP 402 payment middleware for Express, Hono, and Next.js with React components
- MCP Server enabling AI agents to execute blockchain operations via natural language
- CLI scaffolding tool (`create-mantle-devkit-app`) with multiple starter templates
- Live dashboard for API analytics and payment tracking
- Complete mainnet and testnet support with verified contract integrations
- Published NPM packages with full TypeScript support and documentation

---

## Resources

**Live Product**: https://mantle.dev-kit.xyz

**Documentation**: https://mantle.dev-kit.xyz/docs-demo

**Dashboard**: https://mantle.dev-kit.xyz/dashboard

**Block Explorers**:
- https://explorer.mantle.xyz
- https://mantlescan.xyz

**Mantle Network Docs**: https://docs.mantle.xyz

---

## License

Open source under MIT License.
