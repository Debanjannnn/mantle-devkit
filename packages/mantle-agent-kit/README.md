# Mantle Agent Kit

Agent Kit for Mantle Network with integrated DeFi protocol support for swaps, lending, and cross-chain operations.

## Installation

```bash
bun install
```

## Quick Start

```typescript
import { MNTAgentKit } from "mantle-agent-kit";

const agent = new MNTAgentKit("0xYOUR_PRIVATE_KEY", "mainnet");
```

## Integrated Protocols

### DEX Aggregators
- **OKX** - DEX aggregator with HMAC authentication
- **1inch** - DEX aggregator (optional API key)
- **OpenOcean** - DEX aggregator

### DEX
- **Uniswap V3** - Direct contract interaction

### Lending
- **Aave V3** - Supply, withdraw, borrow operations

### Cross-Chain
- **Squid Router** - Cross-chain swaps
- **Stargate** - Cross-chain bridging

## Usage

### Native Token Transfer

```typescript
const txHash = await agent.sendTransaction(
  "0xRecipientAddress",
  "1000000000000000000" // 1 MNT in wei
);
```

### DEX Swaps

```typescript
// Get quote
const quote = await agent.getSwapQuote(
  "0xFromToken",
  "0xToToken",
  "1000000",
  "0.5" // slippage %
);

// Execute swap (OKX)
const txHash = await agent.executeSwap(
  "0xFromToken",
  "0xToToken",
  "1000000",
  "0.5"
);

// OpenOcean
const quote = await agent.getOpenOceanQuote(fromToken, toToken, amount);
const txHash = await agent.swapOnOpenOcean(fromToken, toToken, amount, 0.5);

// 1inch
const quote = await agent.get1inchQuote(fromToken, toToken, amount);
const txHash = await agent.swapOn1inch(fromToken, toToken, amount, 0.5);

// Uniswap V3
const quote = await agent.getUniswapQuote(fromToken, toToken, amount);
const txHash = await agent.swapOnUniswap(fromToken, toToken, amount, 0.5);
```

### Aave V3 Lending

```typescript
// Supply tokens
const txHash = await agent.aaveSupply(tokenAddress, amount);

// Withdraw tokens
const txHash = await agent.aaveWithdraw(tokenAddress, amount, recipientAddress);

// Borrow tokens
const txHash = await agent.aaveBorrow(
  tokenAddress,
  amount,
  2 // 1 = stable, 2 = variable
);
```

### Cross-Chain Operations

```typescript
// Squid Router - Cross-chain swap
const route = await agent.getSquidRoute(
  fromToken,
  toToken,
  fromChainId, // LayerZero chain ID
  toChainId,
  amount,
  1 // slippage %
);
const txHash = await agent.crossChainSwapViaSquid(
  fromToken,
  toToken,
  fromChainId,
  toChainId,
  amount,
  1
);

// Stargate - Bridge tokens
const quote = await agent.getStargateBridgeQuote(
  tokenAddress,
  amount,
  destChainId,
  0.1 // slippage %
);
const txHash = await agent.bridgeViaStargate(
  tokenAddress,
  amount,
  destChainId,
  destAddress,
  srcPoolId, // optional
  dstPoolId, // optional
  0.1
);
```

## Environment Variables

For OKX integration (required):
```
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id
```

For 1inch (optional, for higher rate limits):
```
ONEINCH_API_KEY=your_api_key
```

## Contract Addresses

Update contract addresses in:
- `src/constants/aave/index.ts` - Aave V3 Pool addresses
- `src/constants/stargate/index.ts` - Stargate Router addresses

Verify addresses on [Mantle Explorer](https://explorer.mantle.xyz).

## Chain Support

- Mainnet: Chain ID 5000
- Testnet: Chain ID 5003
