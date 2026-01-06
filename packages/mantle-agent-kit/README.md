# Mantle Agent Kit SDK

TypeScript SDK for seamless integration with DeFi protocols on Mantle Network. Provides unified interfaces for swaps, lending, liquid staking, perpetual trading, and cross-chain operations.

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

| Protocol | Network | Description |
|----------|---------|-------------|
| **OKX DEX** | Mainnet | Multi-source liquidity aggregation |
| **1inch** | Mainnet | Pathfinder algorithm for optimal routes |
| **OpenOcean** | Mainnet | Cross-DEX aggregation |
| **Agni Finance** | Mainnet | Concentrated liquidity DEX (Uniswap V3) |
| **Merchant Moe** | Mainnet | Liquidity Book DEX (TraderJoe V2.1) |
| **Uniswap V3** | Mainnet | Canonical Uniswap V3 contracts |
| **Lendle** | Mainnet | Lending market (Aave V2 fork) |
| **mETH Protocol** | Mainnet | Liquid staking token |
| **PikePerps** | Testnet | Perpetual futures trading (up to 100x) |
| **Squid Router** | Mainnet | Cross-chain swaps via Axelar |

## API Reference

### Token Transfers

```typescript
await agent.sendTransaction(
  recipientAddress: Address,
  amount: string // in wei
): Promise<Address>
```

---

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

---

### Lendle Lending Protocol

#### Supply Assets

```typescript
const txHash = await agent.lendleSupply(
  tokenAddress: Address,
  amount: string
);
```

#### Withdraw Assets

```typescript
const txHash = await agent.lendleWithdraw(
  tokenAddress: Address,
  amount: string,
  to?: Address // optional recipient
);
```

#### Borrow Assets

```typescript
const txHash = await agent.lendleBorrow(
  tokenAddress: Address,
  amount: string,
  interestRateMode?: 1 | 2, // 1 = stable, 2 = variable (default)
  onBehalfOf?: Address
);
```

#### Repay Debt

```typescript
const txHash = await agent.lendleRepay(
  tokenAddress: Address,
  amount: string,
  rateMode?: 1 | 2, // 1 = stable, 2 = variable (default)
  onBehalfOf?: Address
);
```

#### View Account Data

```typescript
const accountData = await agent.lendleGetUserAccountData(
  userAddress?: Address // optional, defaults to agent account
);
// Returns: {
//   totalCollateralETH: bigint,
//   totalDebtETH: bigint,
//   availableBorrowsETH: bigint,
//   currentLiquidationThreshold: bigint,
//   ltv: bigint,
//   healthFactor: bigint
// }
```

#### View All Positions

```typescript
const positions = await agent.lendleGetPositions(
  userAddress?: Address // optional, defaults to agent account
);
// Returns: {
//   positions: LendlePosition[],
//   totalSupplied: bigint,
//   totalDebt: bigint
// }
```

---

### mETH Protocol (Liquid Staking)

```typescript
// Get mETH token address
const methAddress = agent.getMethTokenAddress();
// Returns: 0xcDA86A272531e8640cD7F1a92c01839911B90bb0 (mainnet)

// View mETH position (balances)
const position = await agent.methGetPosition(
  userAddress?: Address // optional, defaults to agent account
);
// Returns: {
//   methBalance: bigint,
//   wethBalance: bigint,
//   wmntBalance: bigint,
//   methTokenAddress: Address,
//   wethTokenAddress: Address,
//   wmntTokenAddress: Address
// }

// Swap WETH to mETH via DEX
const txHash = await agent.swapToMeth(
  amount: string, // WETH amount in wei
  slippage?: number // default: 0.5
);

// Swap mETH to WETH via DEX
const txHash = await agent.swapFromMeth(
  amount: string, // mETH amount in wei
  slippage?: number // default: 0.5
);
```

> **Note**: Actual ETH staking happens on Ethereum L1. On Mantle L2, you can swap to/from mETH via DEX or use it in DeFi protocols. To stake ETH for mETH on L1, use the [official mETH interface](https://www.mantle-meth.xyz/).

---

### PikePerps - Perpetual Trading

Trade perpetual futures with up to 100x leverage on meme tokens.

> **Network**: Mantle Sepolia Testnet only

#### Open Long Position

```typescript
const result = await agent.pikeperpsOpenLong(
  tokenAddress: Address, // Meme token to trade
  margin: string,        // Margin in wei
  leverage?: number      // 1-100, default: 10
);
// Returns: { positionId: bigint, txHash: Hex }
```

#### Open Short Position

```typescript
const result = await agent.pikeperpsOpenShort(
  tokenAddress: Address,
  margin: string,
  leverage?: number // 1-100, default: 10
);
// Returns: { positionId: bigint, txHash: Hex }
```

#### Close Position

```typescript
const txHash = await agent.pikeperpsClosePosition(
  positionId: bigint
);
```

#### View Positions

```typescript
const positions = await agent.pikeperpsGetPositions(
  userAddress?: Address // optional, defaults to agent account
);
// Returns: PikePerpsPosition[] with:
//   positionId, token, isLong, size, margin, leverage,
//   entryPrice, currentPrice, pnl, isProfit,
//   liquidationPrice, isOpen
```

#### Get Market Data

```typescript
const marketData = await agent.pikeperpsGetMarketData(
  tokenAddress: Address,
  limit?: number // default: 20
);
// Returns: {
//   token, currentPrice, hasPrice, isListed, curveProgress,
//   recentTrades: PikePerpsTrade[]
// }
```

---

### Cross-Chain Operations (Squid Router)

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

---

## Configuration

### Environment Variables

#### Platform Configuration (Required)

```env
APP_ID=your_app_id_here

# Optional: Custom platform URL (defaults to https://mantle-devkit.vercel.app)
PLATFORM_URL=https://mantle-devkit.vercel.app
```

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

| Network | Chain ID | Usage |
|---------|----------|-------|
| Mainnet | 5000 | Production (DEX, Lendle, mETH) |
| Testnet (Sepolia) | 5003 | Development, PikePerps |

```typescript
const mainnetAgent = new MNTAgentKit(privateKey, "mainnet");
const testnetAgent = new MNTAgentKit(privateKey, "testnet");
```

### Demo/Simulation Mode

```typescript
// Initialize agent in demo mode
const demoAgent = new MNTAgentKit(privateKey, "testnet-demo");

// All operations return mock responses
const result = await demoAgent.swapOnUniswap(tokenA, tokenB, amount);
// Returns: { txHash: "0xdemo...", demo: true, message: "..." }
```

---

## Contract Addresses

### Mainnet (Chain ID: 5000)

| Protocol | Contract | Address |
|----------|----------|---------|
| **mETH** | Token | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` |
| **WETH** | Token | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` |
| **WMNT** | Token | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` |
| **Lendle** | LendingPool | `0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3` |
| **Lendle** | DataProvider | `0x552b9e4bae485C4B7F540777d7D25614CdB84773` |
| **Agni** | Factory | `0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035` |
| **Agni** | SwapRouter | `0x319B69888b0d11cEC22caA5034e25FfFBDc88421` |
| **Merchant Moe** | LBRouter | `0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a` |
| **Uniswap V3** | SwapRouter | `0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45` |

### Testnet (Chain ID: 5003)

| Protocol | Contract | Address |
|----------|----------|---------|
| **PikePerps** | PerpetualTrading | `0x8081b646f349c049f2d5e8a400057d411dd657bd` |
| **PikePerps** | BondingCurveMarket | `0x93b268325A9862645c82b32229f3B52264750Ca2` |

Verify addresses on [Mantlescan](https://mantlescan.xyz).

---

## Advanced Usage

### Accessing Protocol Constants

```typescript
import {
  AgniConstants,
  LendleConstants,
  MerchantMoeConstants,
  MethConstants,
  UniswapConstants,
  PikePerpsConstants,
} from "mantle-agent-kit-sdk";

// Example: Get Lendle pool address
const poolAddress = LendleConstants.LENDING_POOL.mainnet;

// Example: Get PikePerps contract
const perpsAddress = PikePerpsConstants.PERPETUAL_TRADING.testnet;

// Example: Get mETH/WETH/WMNT addresses
const methToken = MethConstants.METH_TOKEN.mainnet;
const wethToken = MethConstants.WETH_TOKEN.mainnet;
const wmntToken = MethConstants.WMNT_TOKEN.mainnet;
```

### Type Definitions

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

### Project Configuration

```typescript
const agent = new MNTAgentKit(privateKey, "mainnet");
await agent.initialize();

// Access validated project config
console.log("Project Name:", agent.projectConfig?.name);
console.log("Payout Address:", agent.projectConfig?.payTo);
console.log("Network:", agent.projectConfig?.network);
console.log("Status:", agent.projectConfig?.status);
```

---

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

---

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
