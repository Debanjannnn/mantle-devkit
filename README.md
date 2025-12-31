# Mantle DevKit

The complete developer suite for Mantle Network. Build payments and DeFi applications with two powerful SDKs.

## Overview

Mantle DevKit includes:

- **x402-mantle-sdk** - API monetization with HTTP 402 payments
- **mantle-agent-kit-sdk** - DeFi protocol integrations (swaps, lending, cross-chain)

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| `x402-mantle-sdk` | HTTP 402 payment middleware for APIs | [npm](https://www.npmjs.com/package/x402-mantle-sdk) |
| `mantle-agent-kit-sdk` | DeFi protocol integrations | [npm](https://www.npmjs.com/package/mantle-agent-kit-sdk) |

## Quick Start

### x402 - API Monetization

```bash
npm install x402-mantle-sdk
```

```typescript
// Server - Protect API routes with payments
import { x402 } from 'x402-mantle-sdk/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))

// Client - Automatic payment handling
import { x402Fetch } from 'x402-mantle-sdk/client'

const response = await x402Fetch('https://api.example.com/api/premium')
```

### Agent Kit - DeFi Integrations

```bash
npm install mantle-agent-kit-sdk
```

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// DEX Swap
await agent.agniSwap(tokenIn, tokenOut, amount)

// Lending
await agent.lendleSupply(token, amount)

// Cross-chain
await agent.crossChainSwapViaSquid(fromToken, toToken, fromChain, toChain, amount)
```

## x402 SDK

### Features

- HTTP 402 Payment Required protocol
- Server middleware for Hono, Express, Next.js
- Client-side payment modal
- React components
- Multiple tokens: MNT, USDC, USDT, mETH, WMNT
- Automatic 0.5% platform fee splitting

### Server Setup

```typescript
import { x402 } from 'x402-mantle-sdk/server'

// Protect routes with payment
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))

app.get('/api/premium', (c) => {
  return c.json({ data: 'Premium content' })
})
```

### Client Usage

```typescript
import { x402Fetch } from 'x402-mantle-sdk/client'

// Automatically handles 402 responses with payment modal
const response = await x402Fetch('https://api.example.com/api/premium')
const data = await response.json()
```

### Environment Variables

```bash
X402_APP_ID=your-app-id-here
```

## Agent Kit SDK

### Supported Protocols

**DEX Aggregators**
- OKX DEX - Multi-source liquidity aggregation
- 1inch - Pathfinder algorithm for optimal routes
- OpenOcean - Cross-DEX aggregation

**Native DEXs**
- Agni Finance - Uniswap V3 architecture
- Merchant Moe - TraderJoe V2.1 architecture
- Uniswap V3 - Direct integration

**Lending**
- Lendle - Aave V2 architecture

**Cross-Chain**
- Squid Router - Axelar network integration

### DEX Operations

```typescript
// Agni Finance swap
const txHash = await agent.agniSwap(
  "0xTokenIn",
  "0xTokenOut",
  "1000000000000000000", // 1 token in wei
  0.5, // slippage %
  3000 // fee tier
)

// 1inch aggregator
const quote = await agent.get1inchQuote(fromToken, toToken, amount)
const txHash = await agent.swapOn1inch(fromToken, toToken, amount, 0.5)

// OpenOcean
const txHash = await agent.swapOnOpenOcean(fromToken, toToken, amount, 0.5)
```

### Lending Operations

```typescript
// Supply assets to earn yield
await agent.lendleSupply(tokenAddress, amount)

// Borrow against collateral
await agent.lendleBorrow(tokenAddress, amount, 2) // 2 = variable rate

// Repay debt
await agent.lendleRepay(tokenAddress, amount)

// Withdraw
await agent.lendleWithdraw(tokenAddress, amount)
```

### Cross-Chain Operations

```typescript
// Get route
const route = await agent.getSquidRoute(
  fromToken, toToken,
  181, // Mantle LayerZero ID
  1,   // Ethereum LayerZero ID
  amount
)

// Execute cross-chain swap
const txHash = await agent.crossChainSwapViaSquid(
  fromToken, toToken,
  181, 1, // from Mantle to Ethereum
  amount, 1 // 1% slippage
)
```

### Environment Variables

```bash
# Required
APP_ID=your_app_id_here

# OKX DEX (optional)
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id

# 1inch (optional - higher rate limits)
ONEINCH_API_KEY=your_api_key
```

## Networks

| Network | Chain ID | Environment |
|---------|----------|-------------|
| Mantle Mainnet | 5000 | Production |
| Mantle Sepolia | 5003 | Testnet |

## Contract Addresses (Mainnet)

**Lendle Protocol**
- LendingPool: `0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3`

**Agni Finance**
- SwapRouter: `0x319B69888b0d11cEC22caA5034e25FfFBDc88421`

**Merchant Moe**
- LBRouter: `0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a`

**Uniswap V3**
- SwapRouter: `0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45`

**mETH Protocol**
- mETH Token: `0xcDA86A272531e8640cD7F1a92c01839911B90bb0`

## Project Structure

```
mantle-devkit/
├── packages/
│   ├── x402-devkit/          # x402 API monetization SDK
│   └── mantle-agent-kit/     # DeFi protocol integrations
├── sdk-fe/                   # Dashboard & documentation frontend
└── README.md
```

## Development

```bash
# Install dependencies
bun install

# Build packages
bun run build

# Type check
bun run typecheck

# Development mode
bun run dev
```

## License

MIT

## Links

- [Dashboard](https://devkit.x402.io)
- [x402 npm](https://www.npmjs.com/package/x402-mantle-sdk)
- [Agent Kit npm](https://www.npmjs.com/package/mantle-agent-kit-sdk)
- [Mantlescan](https://mantlescan.xyz)
