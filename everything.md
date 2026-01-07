# Mantle DevKit - Complete Documentation

The complete developer toolkit for building applications on Mantle Network. This document covers everything you need to know about building DeFi applications, monetizing APIs, and creating AI agents on Mantle.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Package 1: Mantle Agent Kit SDK](#package-1-mantle-agent-kit-sdk)
4. [Package 2: x402 DevKit SDK](#package-2-x402-devkit-sdk)
5. [Package 3: create-x402-app CLI](#package-3-create-x402-app-cli)
6. [Package 4: MCP Server](#package-4-mcp-server)
7. [Dashboard & Platform](#dashboard--platform)
8. [Network Configuration](#network-configuration)
9. [Use Cases & Examples](#use-cases--examples)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**Mantle DevKit** is a comprehensive monorepo containing 4 npm packages designed to simplify development on Mantle Network:

| Package | npm | Purpose |
|---------|-----|---------|
| `mantle-agent-kit-sdk` | v1.0.4 | DeFi protocol integrations (swaps, lending, staking, perps) |
| `x402-mantle-sdk` | v0.2.8 | API monetization with HTTP 402 payments |
| `create-x402-app` | v0.1.10 | CLI scaffolding for x402 projects |
| `mantle-mcp-server` | v1.0.0 | MCP server for Claude AI integration |

**Key Benefits:**
- Unified API for 10+ DeFi protocols
- Sub-cent transaction costs on Mantle L2
- TypeScript-first with full type safety
- Framework agnostic (Hono, Express, Next.js)
- AI-ready with MCP integration

---

## Architecture

```
mantle-devkit/
├── packages/
│   ├── mantle-agent-kit/      # DeFi SDK
│   │   ├── src/
│   │   │   ├── agent.ts       # Main MNTAgentKit class
│   │   │   ├── tools/         # Protocol integrations
│   │   │   ├── constants/     # Contract addresses & ABIs
│   │   │   ├── utils/         # Helper functions
│   │   │   └── helpers/       # API integrations
│   │   └── dist/              # Built output
│   │
│   ├── x402-devkit/           # API monetization SDK
│   │   ├── src/
│   │   │   ├── server/        # Middleware (Hono, Express)
│   │   │   └── client/        # Frontend (React, Vanilla)
│   │   └── dist/
│   │
│   ├── create-x402-app/       # CLI tool
│   │   ├── src/index.ts       # CLI logic
│   │   └── templates/         # Project templates
│   │
│   └── mantle-devkit-mcp/     # MCP server
│       └── src/
│           ├── index.ts       # Server entry
│           └── resources/     # Documentation resources
│
├── sdk-fe/                    # Dashboard frontend (Next.js)
└── everything.md              # This file
```

---

## Package 1: Mantle Agent Kit SDK

The core SDK for interacting with DeFi protocols on Mantle Network.

### Installation

```bash
npm install mantle-agent-kit-sdk
# or
bun install mantle-agent-kit-sdk
```

### Supported Protocols

| Protocol | Type | Network | Description |
|----------|------|---------|-------------|
| **OKX DEX** | Aggregator | Both | Multi-source liquidity |
| **1inch** | Aggregator | Both | Pathfinder routing |
| **OpenOcean** | Aggregator | Both | Cross-DEX aggregation |
| **Agni Finance** | DEX | Mainnet | Uniswap V3 fork |
| **Merchant Moe** | DEX | Mainnet | TraderJoe V2.1 fork |
| **Uniswap V3** | DEX | Mainnet | Canonical contracts |
| **Lendle** | Lending | Mainnet | Aave V2 fork |
| **mETH Protocol** | Staking | Mainnet | Liquid staking |
| **PikePerps** | Perpetuals | Testnet | 100x leverage trading |
| **Squid Router** | Bridge | Both | Cross-chain via Axelar |

### Quick Start

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

// Initialize agent
const agent = new MNTAgentKit(
  "0xYOUR_PRIVATE_KEY",
  "mainnet" // or "testnet" or "testnet-demo"
);

// Optional: Validate with platform
await agent.initialize();

// Now use any protocol!
```

### DEX Operations

#### Get Quotes

```typescript
// OKX Aggregator
const okxQuote = await agent.getSwapQuote(
  "0xFromToken",
  "0xToToken",
  "1000000000000000000", // 1 token in wei
  "0.5" // slippage %
);

// 1inch
const oneInchQuote = await agent.get1inchQuote(fromToken, toToken, amount);

// OpenOcean
const openOceanQuote = await agent.getOpenOceanQuote(fromToken, toToken, amount);

// Uniswap V3
const uniswapQuote = await agent.getUniswapQuote(fromToken, toToken, amount);
```

#### Execute Swaps

```typescript
// OKX Aggregator
const txHash = await agent.executeSwap(fromToken, toToken, amount, "0.5");

// 1inch
const txHash = await agent.swapOn1inch(fromToken, toToken, amount, 0.5);

// OpenOcean
const txHash = await agent.swapOnOpenOcean(fromToken, toToken, amount, 0.5);

// Uniswap V3
const txHash = await agent.swapOnUniswap(fromToken, toToken, amount, 0.5);

// Agni Finance (with optional fee tier)
const txHash = await agent.agniSwap(tokenIn, tokenOut, amount, 0.5, 3000);

// Merchant Moe
const txHash = await agent.merchantMoeSwap(tokenIn, tokenOut, amount, 0.5);
```

### Lending Operations (Lendle)

```typescript
// Supply assets to earn yield
const txHash = await agent.lendleSupply(
  "0xTokenAddress",
  "1000000000000000000" // amount in wei
);

// Withdraw supplied assets
const txHash = await agent.lendleWithdraw(
  "0xTokenAddress",
  "1000000000000000000",
  "0xOptionalRecipient" // optional
);

// Borrow against collateral
const txHash = await agent.lendleBorrow(
  "0xTokenAddress",
  "500000000000000000",
  2, // 1 = stable rate, 2 = variable rate (default)
  "0xOnBehalfOf" // optional
);

// Repay borrowed assets
const txHash = await agent.lendleRepay(
  "0xTokenAddress",
  "500000000000000000",
  2, // rate mode
  "0xOnBehalfOf" // optional
);

// View account health
const accountData = await agent.lendleGetUserAccountData();
// Returns: {
//   totalCollateralETH: bigint,
//   totalDebtETH: bigint,
//   availableBorrowsETH: bigint,
//   currentLiquidationThreshold: bigint,
//   ltv: bigint,
//   healthFactor: bigint
// }

// View all positions per token
const positions = await agent.lendleGetPositions();
// Returns: {
//   positions: LendlePosition[],
//   totalSupplied: bigint,
//   totalDebt: bigint
// }
```

### Liquid Staking (mETH Protocol)

```typescript
// Get mETH token address
const methAddress = agent.getMethTokenAddress();
// Mainnet: 0xcDA86A272531e8640cD7F1a92c01839911B90bb0

// View your mETH position
const position = await agent.methGetPosition();
// Returns: {
//   methBalance: bigint,
//   wethBalance: bigint,
//   wmntBalance: bigint,
//   methTokenAddress: Address,
//   wethTokenAddress: Address,
//   wmntTokenAddress: Address
// }

// Swap WETH to mETH (acquire mETH via DEX)
const txHash = await agent.swapToMeth(
  "1000000000000000000", // 1 WETH
  0.5 // slippage
);

// Swap mETH to WETH (exit mETH position)
const txHash = await agent.swapFromMeth(
  "1000000000000000000", // 1 mETH
  0.5
);
```

### Perpetual Trading (PikePerps) - Testnet Only

```typescript
// Switch to testnet
const agent = new MNTAgentKit(privateKey, "testnet");

// Open a long position (bet price goes up)
const { positionId, txHash } = await agent.pikeperpsOpenLong(
  "0xMemeTokenAddress", // token to trade
  "100000000000000000", // 0.1 ETH margin
  10 // 10x leverage (1-100)
);

// Open a short position (bet price goes down)
const { positionId, txHash } = await agent.pikeperpsOpenShort(
  "0xMemeTokenAddress",
  "100000000000000000",
  10
);

// Close a position
const txHash = await agent.pikeperpsClosePosition(positionId);

// View all your positions
const positions = await agent.pikeperpsGetPositions();
// Returns: PikePerpsPosition[] with:
//   positionId, token, isLong, size, margin, leverage,
//   entryPrice, currentPrice, pnl, isProfit,
//   liquidationPrice, isOpen

// Get market data for a token
const marketData = await agent.pikeperpsGetMarketData(
  "0xMemeTokenAddress",
  20 // limit of recent trades
);
// Returns: {
//   token, currentPrice, hasPrice, isListed,
//   curveProgress, recentTrades: PikePerpsTrade[]
// }
```

### Cross-Chain Operations (Squid Router)

```typescript
// Get cross-chain route
const route = await agent.getSquidRoute(
  "0xFromToken",
  "0xToToken",
  5000,  // from Mantle (chain ID)
  1,     // to Ethereum (chain ID)
  "1000000000000000000",
  1 // slippage %
);

// Execute cross-chain swap
const txHash = await agent.crossChainSwapViaSquid(
  fromToken,
  toToken,
  fromChainId,
  toChainId,
  amount,
  slippage
);
```

### Native Token Transfers

```typescript
// Send MNT to another address
const txHash = await agent.sendTransaction(
  "0xRecipientAddress",
  "1000000000000000000" // 1 MNT in wei
);
```

### Environment Variables

```env
# Required for platform validation
APP_ID=your_app_id

# Optional platform URL
PLATFORM_URL=https://mantle-devkit.vercel.app

# OKX DEX (required for OKX methods)
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id

# 1inch (optional, for higher rate limits)
ONEINCH_API_KEY=your_api_key
```

### Accessing Constants

```typescript
import {
  AgniConstants,
  LendleConstants,
  MerchantMoeConstants,
  MethConstants,
  UniswapConstants,
  PikePerpsConstants,
} from "mantle-agent-kit-sdk";

// Get contract addresses
const lendlePool = LendleConstants.LENDING_POOL.mainnet;
const agniRouter = AgniConstants.SWAP_ROUTER.mainnet;
const methToken = MethConstants.METH_TOKEN.mainnet;
const perpsContract = PikePerpsConstants.PERPETUAL_TRADING.testnet;
```

### Type Exports

```typescript
import type {
  UserAccountData,
  ProjectConfig,
  LendlePosition,
  LendlePositionsResult,
  MethPosition,
  PikePerpsPosition,
  PikePerpsMarketData,
  PikePerpsTrade,
} from "mantle-agent-kit-sdk";
```

### Demo Mode

```typescript
// Use demo mode for testing without real transactions
const demoAgent = new MNTAgentKit(privateKey, "testnet-demo");

// All operations return mock responses
const result = await demoAgent.swapOnUniswap(tokenA, tokenB, amount);
// Returns: { txHash: "0xdemo...", demo: true, message: "..." }
```

---

## Package 2: x402 DevKit SDK

Monetize your APIs using the HTTP 402 Payment Required protocol.

### Installation

```bash
npm install x402-mantle-sdk
# or
bun install x402-mantle-sdk
```

### How x402 Works

1. Client makes API request
2. Server returns HTTP 402 with payment details
3. Client pays on Mantle Network
4. Client retries request with payment proof
5. Server verifies payment and returns data

**Benefits:**
- Sub-cent transaction fees
- No credit cards or subscriptions
- Pay-per-use model
- Global accessibility
- Instant settlement

### Server Setup

#### Hono Framework

```typescript
import { Hono } from 'hono';
import { x402 } from 'x402-mantle-sdk/server';

const app = new Hono();

// Free endpoint
app.get('/api/free', (c) => {
  return c.json({ message: 'This is free!' });
});

// Paid endpoint - $0.001 per request
app.use('/api/premium/*', x402({
  price: '0.001',
  token: 'USDC',
  network: 'mantle',
  endpoint: '/api/premium',
  method: 'GET',
  description: 'Premium API access',
  enableAnalytics: true, // Track on dashboard
}));

app.get('/api/premium/data', (c) => {
  return c.json({
    secret: 'Premium data here!',
    timestamp: Date.now()
  });
});

export default app;
```

#### Express Framework

```typescript
import express from 'express';
import { x402Express } from 'x402-mantle-sdk/server';

const app = express();

// Free endpoint
app.get('/api/free', (req, res) => {
  res.json({ message: 'Free content' });
});

// Paid endpoint
app.use('/api/premium', x402Express({
  price: '0.01',
  token: 'MNT',
  network: 'mantle',
  endpoint: '/api/premium',
  method: 'POST',
}));

app.post('/api/premium', (req, res) => {
  res.json({ data: 'Premium content' });
});

app.listen(3000);
```

#### Next.js API Routes

```typescript
// app/api/premium/route.ts
import { x402 } from 'x402-mantle-sdk/server';

export async function GET(request: Request) {
  // Check payment
  const paymentCheck = await x402({
    price: '0.001',
    token: 'USDC',
    network: 'mantle',
    endpoint: '/api/premium',
    method: 'GET',
  })(request);

  if (paymentCheck) {
    return paymentCheck; // Returns 402 if unpaid
  }

  // Payment verified, return data
  return Response.json({ data: 'Premium content' });
}
```

### Client Integration

#### Basic Fetch with Auto-Payment

```typescript
import { x402Fetch } from 'x402-mantle-sdk/client';

// Automatically handles 402 responses with payment modal
const response = await x402Fetch('https://api.example.com/api/premium');
const data = await response.json();
```

#### Custom Client Configuration

```typescript
import { X402Client } from 'x402-mantle-sdk/client';

const client = new X402Client({
  onPaymentRequired: (details) => {
    console.log('Payment needed:', details.amount, details.token);
  },
  onPaymentSuccess: (receipt) => {
    console.log('Paid!', receipt.transactionHash);
  },
  onPaymentError: (error) => {
    console.error('Payment failed:', error);
  },
});

const response = await client.fetch('https://api.example.com/premium');
```

### React Integration

#### Payment Modal Component

```tsx
import { useState } from 'react';
import { EnhancedPaymentModal } from 'x402-mantle-sdk/client/react';

function PremiumFeature() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);

  const handlePremiumClick = async () => {
    try {
      const response = await fetch('/api/premium');

      if (response.status === 402) {
        const paymentDetails = await response.json();
        setPaymentRequest(paymentDetails);
        setIsModalOpen(true);
      } else {
        const data = await response.json();
        console.log('Data:', data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={handlePremiumClick}>
        Access Premium Feature
      </button>

      <EnhancedPaymentModal
        request={paymentRequest}
        isOpen={isModalOpen}
        onComplete={(payment) => {
          console.log('Payment complete!', payment.transactionHash);
          setIsModalOpen(false);
          // Retry the request with payment proof
        }}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
```

#### Using x402Fetch in React

```tsx
import { x402Fetch } from 'x402-mantle-sdk/client';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPremiumData = async () => {
    setLoading(true);
    try {
      // Automatically shows payment modal if 402
      const response = await x402Fetch('/api/premium-data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={fetchPremiumData} disabled={loading}>
        {loading ? 'Loading...' : 'Get Premium Data'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Supported Tokens

| Token | Mainnet Address | Decimals |
|-------|-----------------|----------|
| MNT | Native | 18 |
| USDC | `0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9` | 6 |
| USDT | `0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE` | 6 |
| WMNT | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | 18 |
| mETH | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` | 18 |

### Pricing Examples

```typescript
// Price per API call
x402({ price: '0.001', token: 'USDC' }) // $0.001

// Price in MNT
x402({ price: '0.1', token: 'MNT' }) // 0.1 MNT

// Price in stablecoins
x402({ price: '1.00', token: 'USDT' }) // $1.00
```

### Fee Structure

- **Platform Fee:** 0.5% (automatically handled)
- **Gas Costs:** < $0.001 per transaction
- **No hidden fees**

### Environment Variables

```env
# Required for dashboard tracking
X402_APP_ID=your-project-app-id

# Optional custom platform URL
X402_PLATFORM_URL=https://mantle-x402.vercel.app
```

---

## Package 3: create-x402-app CLI

Quickly scaffold x402 payment-enabled applications.

### Usage

```bash
# Interactive mode
npx create-x402-app

# With project name
npx create-x402-app my-api

# Non-interactive
npx create-x402-app my-api --template fullstack-hono
```

### Available Templates

| Template | Description |
|----------|-------------|
| `backend-hono` | Standalone Hono API server |
| `backend-express` | Standalone Express API server |
| `fullstack-hono` | Next.js + Hono API routes |
| `fullstack-express` | Next.js + Express-style routes |

### What's Included

Each template includes:
- Pre-configured x402 middleware
- Example free and paid endpoints
- Wallet connection UI (fullstack)
- Payment modal integration (fullstack)
- TypeScript configuration
- Environment setup
- Ready-to-deploy code

### Example: Creating a Backend

```bash
npx create-x402-app my-api
# Select: Backend only
# Select: Hono
# Select: bun

cd my-api
bun install
bun run dev
```

Your API is now running with:
- `GET /api/free` - Free endpoint
- `GET /api/premium` - Paid endpoint ($0.001)

---

## Package 4: MCP Server

Model Context Protocol server for Claude AI integration.

### Installation

```bash
npm install -g mantle-mcp-server
```

### Configuration for Claude Desktop

Add to your Claude Desktop config (`~/.config/claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mantle-devkit": {
      "command": "npx",
      "args": ["mantle-mcp-server"]
    }
  }
}
```

### Available Tools

#### search_mantle_docs

Search across all Mantle DevKit documentation.

```
Input: { "query": "swap tokens" }
Output: Relevant documentation about token swaps
```

#### get_contract_address

Get contract addresses for protocols.

```
Input: {
  "protocol": "lendle",
  "contract": "pool"
}
Output: "0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3"
```

#### get_code_example

Get code examples for common operations.

```
Input: { "operation": "swap" }
Output: Complete swap code example
```

### Supported Queries

- `swap`, `exchange`, `trade` - DEX operations
- `lend`, `borrow`, `supply` - Lending operations
- `stake`, `meth`, `liquid staking` - Staking
- `perps`, `leverage`, `long`, `short` - Perpetuals
- `x402`, `payment`, `monetize` - API monetization
- `cross-chain`, `bridge` - Cross-chain operations

---

## Dashboard & Platform

### Accessing the Dashboard

Visit: **https://mantle-devkit.vercel.app**

### Features

1. **Project Management**
   - Create and manage projects
   - Get APP_ID for SDK integration
   - Configure payout addresses

2. **Analytics**
   - Real-time payment tracking
   - Revenue analytics
   - Usage statistics
   - Endpoint performance

3. **Documentation**
   - Interactive guides
   - Code examples
   - API reference

### Creating a Project

1. Connect your wallet
2. Click "Create Project"
3. Enter project details
4. Copy your APP_ID
5. Add to environment variables

---

## Network Configuration

### Mantle Mainnet

| Property | Value |
|----------|-------|
| Chain ID | 5000 |
| RPC URL | https://rpc.mantle.xyz |
| Explorer | https://mantlescan.xyz |
| Native Token | MNT |

### Mantle Sepolia (Testnet)

| Property | Value |
|----------|-------|
| Chain ID | 5003 |
| RPC URL | https://rpc.sepolia.mantle.xyz |
| Explorer | https://sepolia.mantlescan.xyz |
| Native Token | MNT |

### Contract Addresses

#### Mainnet

| Protocol | Contract | Address |
|----------|----------|---------|
| mETH | Token | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` |
| WETH | Token | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` |
| WMNT | Token | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` |
| USDC | Token | `0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9` |
| USDT | Token | `0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE` |
| Lendle | LendingPool | `0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3` |
| Lendle | DataProvider | `0x552b9e4bae485C4B7F540777d7D25614CdB84773` |
| Agni | SwapRouter | `0x319B69888b0d11cEC22caA5034e25FfFBDc88421` |
| Agni | Factory | `0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035` |
| Merchant Moe | LBRouter | `0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a` |
| Uniswap V3 | SwapRouter | `0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45` |

#### Testnet

| Protocol | Contract | Address |
|----------|----------|---------|
| PikePerps | PerpetualTrading | `0x8081b646f349c049f2d5e8a400057d411dd657bd` |
| PikePerps | BondingCurveMarket | `0x93b268325A9862645c82b32229f3B52264750Ca2` |

---

## Use Cases & Examples

### 1. Build a Trading Bot

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet");

async function arbitrageBot() {
  // Get quotes from multiple DEXs
  const [agniQuote, merchantMoeQuote] = await Promise.all([
    agent.getUniswapQuote(WETH, USDC, amount),
    agent.getOpenOceanQuote(WETH, USDC, amount),
  ]);

  // Find best price and execute
  if (agniQuote.outAmount > merchantMoeQuote.outAmount) {
    await agent.swapOnUniswap(WETH, USDC, amount);
  } else {
    await agent.swapOnOpenOcean(WETH, USDC, amount);
  }
}
```

### 2. Yield Farming Strategy

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet");

async function yieldFarm() {
  // Swap to USDC
  await agent.swapOnOpenOcean(WMNT, USDC, amount);

  // Supply to Lendle for yield
  await agent.lendleSupply(USDC, amount);

  // Check position
  const position = await agent.lendleGetPositions();
  console.log("Supplied:", position.totalSupplied);
}
```

### 3. Monetize an AI API

```typescript
// server.ts
import { Hono } from 'hono';
import { x402 } from 'x402-mantle-sdk/server';
import OpenAI from 'openai';

const app = new Hono();
const openai = new OpenAI();

// Charge $0.01 per AI request
app.use('/api/ai/*', x402({
  price: '0.01',
  token: 'USDC',
  network: 'mantle',
  endpoint: '/api/ai',
  method: 'POST',
}));

app.post('/api/ai/chat', async (c) => {
  const { prompt } = await c.req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return c.json({ response: response.choices[0].message });
});

export default app;
```

### 4. Data Marketplace

```typescript
// Charge for premium data
app.use('/api/market-data', x402({
  price: '0.001',
  token: 'USDC',
  network: 'mantle',
  endpoint: '/api/market-data',
  method: 'GET',
  description: 'Real-time market data',
}));

app.get('/api/market-data', async (c) => {
  const data = await fetchMarketData();
  return c.json(data);
});
```

### 5. Perpetual Trading Interface

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "testnet");

async function tradeMemeCoins() {
  // Get market data
  const market = await agent.pikeperpsGetMarketData(MEME_TOKEN);
  console.log("Current price:", market.currentPrice);

  // Open 10x long
  const { positionId } = await agent.pikeperpsOpenLong(
    MEME_TOKEN,
    "100000000000000000", // 0.1 ETH margin
    10 // 10x leverage
  );

  // Monitor position
  const positions = await agent.pikeperpsGetPositions();
  const myPosition = positions.find(p => p.positionId === positionId);

  console.log("PnL:", myPosition?.pnl, myPosition?.isProfit ? "profit" : "loss");

  // Close when profitable
  if (myPosition?.isProfit && myPosition.pnl > threshold) {
    await agent.pikeperpsClosePosition(positionId);
  }
}
```

---

## Troubleshooting

### Common Issues

#### "APP_ID not set"
```
Solution: Set APP_ID in environment variables
APP_ID=your_app_id_from_dashboard
```

#### "Transaction reverted"
```
Causes:
- Insufficient balance
- Slippage too low
- Token not approved

Solutions:
- Check wallet balance
- Increase slippage (e.g., 1-2%)
- Ensure token approval for router contracts
```

#### "Network mismatch"
```
Solution: Ensure you're on the correct network
- Mainnet: Chain ID 5000
- Testnet: Chain ID 5003
```

#### "x402 payment not detected"
```
Causes:
- Payment not confirmed
- Wrong recipient address
- Network congestion

Solutions:
- Wait for transaction confirmation
- Verify payment details in 402 response
- Check transaction on Mantlescan
```

### Debug Mode

```typescript
// Enable verbose logging
const agent = new MNTAgentKit(privateKey, "mainnet");

// Use demo mode for testing
const demoAgent = new MNTAgentKit(privateKey, "testnet-demo");
```

### Getting Help

- **GitHub Issues:** https://github.com/Debanjannnn/mantle-devkit/issues
- **Dashboard:** https://mantle-devkit.vercel.app
- **Mantle Docs:** https://docs.mantle.xyz

---

## Resources

- [Mantle DevKit Dashboard](https://mantle-devkit.vercel.app)
- [Mantle Network Documentation](https://docs.mantle.xyz/)
- [Mantlescan Explorer](https://mantlescan.xyz/)
- [Lendle Protocol](https://lendle.xyz/)
- [Agni Finance](https://agni.finance/)
- [Merchant Moe](https://merchantmoe.com/)
- [mETH Protocol](https://www.mantle-meth.xyz/)

---

## License

MIT License - See individual package LICENSE files for details.

---

**Built for developers, by developers.**

Start building on Mantle today!
