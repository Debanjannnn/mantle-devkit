# Mantle Agent Kit SDK

TypeScript SDK for seamless integration with DeFi protocols on Mantle Network. Provides unified interfaces for swaps, lending, liquid staking, and cross-chain operations.

Part of [Mantle DevKit](https://mantle-devkit.vercel.app) - the complete developer suite for Mantle.

## Installation

```bash
npm install mantle-agent-kit-sdk
# or
bun install mantle-agent-kit-sdk
```

## Quick Start

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

// Initialize agent with private key and network
const agent = new MNTAgentKit("0xYOUR_PRIVATE_KEY", "mainnet");

// Initialize with platform validation (validates APP_ID from environment)
await agent.initialize();

// Execute a native token transfer
const txHash = await agent.sendTransaction(
  "0xRecipientAddress",
  "1000000000000000000" // 1 MNT in wei
);
```

## Supported Protocols

### DEX Aggregators
- **OKX DEX Aggregator** - Multi-source liquidity aggregation with HMAC authentication
- **1inch** - Pathfinder algorithm for optimal swap routes (optional API key)
- **OpenOcean** - Cross-DEX aggregation for best execution prices

### Native Mantle DEXs
- **Agni Finance** - Leading DEX on Mantle with concentrated liquidity (Uniswap V3 architecture)
- **Merchant Moe** - Liquidity Book DEX with dynamic fee tiers (TraderJoe V2.1 architecture)
- **Uniswap V3** - Direct integration with canonical Uniswap V3 contracts

### Lending Protocols
- **Lendle** - Mantle's primary lending market with supply, borrow, and collateralization (Aave V2 architecture)

### Liquid Staking
- **mETH Protocol** - Mantle's native liquid staking derivative for Ethereum

### Cross-Chain Infrastructure
- **Squid Router** - Seamless cross-chain swaps via Axelar network

## API Reference

### Token Transfers

Send native MNT tokens to any address.

```typescript
await agent.sendTransaction(
  recipientAddress: Address,
  amount: string // in wei
): Promise<Address>
```

### DEX Operations

#### OKX DEX Aggregator

```typescript
// Get optimal swap quote
const quote = await agent.getSwapQuote(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippagePercentage?: string // default: "0.5"
);

// Execute swap
const txHash = await agent.executeSwap(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippagePercentage?: string // default: "0.5"
);
```

#### 1inch

```typescript
const quote = await agent.get1inchQuote(
  fromToken: Address,
  toToken: Address,
  amount: string
);

const txHash = await agent.swapOn1inch(
  fromToken: Address,
  toToken: Address,
  amount: string,
  slippage?: number // default: 0.5
);
```

#### OpenOcean

```typescript
const quote = await agent.getOpenOceanQuote(
  fromToken: Address,
  toToken: Address,
  amount: string
);

const txHash = await agent.swapOnOpenOcean(
  fromToken: Address,
  toToken: Address,
  amount: string,
  slippage?: number // default: 0.5
);
```

#### Uniswap V3

```typescript
const quote = await agent.getUniswapQuote(
  fromToken: Address,
  toToken: Address,
  amount: string
);

const txHash = await agent.swapOnUniswap(
  fromToken: Address,
  toToken: Address,
  amount: string,
  slippage?: number // default: 0.5
);
```

#### Agni Finance

```typescript
const txHash = await agent.agniSwap(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent?: number, // default: 0.5
  feeTier?: number // optional: 500, 3000, 10000
);
```

#### Merchant Moe

```typescript
const txHash = await agent.merchantMoeSwap(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent?: number // default: 0.5
);
```

### Lendle Lending Protocol

#### Supply Assets

Deposit tokens to earn yield and use as collateral.

```typescript
const txHash = await agent.lendleSupply(
  tokenAddress: Address,
  amount: string
);
```

#### Withdraw Assets

Withdraw previously supplied tokens.

```typescript
const txHash = await agent.lendleWithdraw(
  tokenAddress: Address,
  amount: string,
  to?: Address // optional recipient
);
```

#### Borrow Assets

Borrow against supplied collateral.

```typescript
const txHash = await agent.lendleBorrow(
  tokenAddress: Address,
  amount: string,
  interestRateMode?: 1 | 2, // 1 = stable, 2 = variable (default)
  onBehalfOf?: Address // optional
);
```

#### Repay Debt

Repay borrowed assets.

```typescript
const txHash = await agent.lendleRepay(
  tokenAddress: Address,
  amount: string,
  rateMode?: 1 | 2, // 1 = stable, 2 = variable (default)
  onBehalfOf?: Address // optional
);
```

### mETH Protocol

Access Mantle's liquid staking token address.

```typescript
const methAddress = agent.getMethTokenAddress();
// Returns: 0xcDA86A272531e8640cD7F1a92c01839911B90bb0 (mainnet)
```

Note: To stake ETH for mETH, use the [official mETH interface](https://www.mantle-meth.xyz/).

### Cross-Chain Operations

#### Squid Router

Execute cross-chain swaps via Axelar network.

```typescript
// Get cross-chain route
const route = await agent.getSquidRoute(
  fromToken: Address,
  toToken: Address,
  fromChain: number, // LayerZero chain ID
  toChain: number,
  amount: string,
  slippage?: number // default: 1
);

// Execute cross-chain swap
const txHash = await agent.crossChainSwapViaSquid(
  fromToken: Address,
  toToken: Address,
  fromChain: number,
  toChain: number,
  amount: string,
  slippage?: number // default: 1
);
```

## Configuration

### Environment Variables

#### Platform Configuration (Required)

The Mantle Agent Kit requires an APP_ID for platform validation and authentication.

```env
APP_ID=your_app_id_here

# Optional: Custom platform URL (defaults to https://mantle-devkit.vercel.app)
PLATFORM_URL=https://mantle-devkit.vercel.app
```

**What is APP_ID?**

APP_ID is a unique identifier that authenticates your application and validates access to the Mantle Agent Kit. When you call `agent.initialize()`, it validates your APP_ID with the platform API and returns your project configuration (name, payout address, network, status).

#### OKX DEX (Required for OKX methods)

```env
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id
```

#### 1inch (Optional - Higher rate limits)

```env
ONEINCH_API_KEY=your_api_key
```

### Network Configuration

The SDK supports both Mantle mainnet and testnet:

- **Mainnet**: Chain ID 5000
- **Testnet**: Chain ID 5003 (Sepolia)

```typescript
const mainnetAgent = new MNTAgentKit(privateKey, "mainnet");
const testnetAgent = new MNTAgentKit(privateKey, "testnet");
```

## Contract Addresses

All protocol contract addresses are pre-configured for Mantle Mainnet:

**Lendle Protocol**
- LendingPool: `0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3`
- DataProvider: `0xD0E0b5e99c8a36f4c5234cd1E90CFc5C2Bb58A69`

**Agni Finance**
- Factory: `0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035`
- SwapRouter: `0x319B69888b0d11cEC22caA5034e25FfFBDc88421`
- NonfungiblePositionManager: `0x9C9e335A3BC0EF6F66F44390c383D0bB7a0A34f0`

**Merchant Moe**
- LBRouter: `0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a`
- LBFactory: `0xa6630671775c4EA2743840F9A5016dCf2A104054`
- LBQuoter: `0xFa1ec885c522Ee2c06aFCfBC66E88a88ca09EEED`

**mETH Protocol**
- mETH Token: `0xcDA86A272531e8640cD7F1a92c01839911B90bb0`

**Uniswap V3**
- SwapRouter: `0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45`
- QuoterV2: `0x61fFE014bA17989E743c5F6cB21bF9697530B21e`

Verify current addresses on [Mantlescan](https://mantlescan.xyz).

## Advanced Usage

### Accessing Protocol Constants

Import protocol-specific constants for advanced integrations:

```typescript
import {
  AgniConstants,
  LendleConstants,
  MerchantMoeConstants,
  MethConstants,
  UniswapConstants,
} from "mantle-agent-kit-sdk";

// Example: Get Lendle pool address
const poolAddress = LendleConstants.LENDING_POOL.mainnet;
```

### Type Definitions

Import utility types for type-safe development:

```typescript
import type { UserAccountData, ProjectConfig } from "mantle-agent-kit-sdk";

// UserAccountData returned from Lendle user queries
// ProjectConfig returned from platform validation
```

### Accessing Project Configuration

After initializing the agent, you can access the validated project configuration:

```typescript
const agent = new MNTAgentKit(privateKey, "mainnet");
await agent.initialize();

// Access validated project config
console.log("Project Name:", agent.projectConfig?.name);
console.log("Payout Address:", agent.projectConfig?.payTo);
console.log("Network:", agent.projectConfig?.network);
console.log("Status:", agent.projectConfig?.status);
```

## Development

### Build from Source

```bash
# Install dependencies
bun install

# Build package
bun run build

# Type check
bun run typecheck
```

### Package Structure

```
dist/
├── index.js          # ESM build
├── index.cjs         # CommonJS build
├── index.d.ts        # TypeScript declarations
└── *.map             # Source maps
```

## License

MIT

## Resources

- [Mantle DevKit Dashboard](https://mantle-devkit.vercel.app)
- [Mantle Network Documentation](https://docs.mantle.xyz/)
- [Mantlescan Explorer](https://mantlescan.xyz/)
- [Lendle Protocol](https://lendle.xyz/)
- [Agni Finance](https://agni.finance/)
- [Merchant Moe](https://merchantmoe.com/)
- [mETH Protocol](https://www.mantle-meth.xyz/)
