# Mantle DevKit Packages

This directory contains the npm packages for Mantle DevKit.

## Network Configuration

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| **Mainnet** | 5000 | https://rpc.mantle.xyz |
| **Testnet (Sepolia)** | 5003 | https://rpc.sepolia.mantle.xyz |

---

## Protocol Support: Testnet vs Mainnet

### Supported on Both Testnet & Mainnet

| Protocol | Testnet | Mainnet | Description |
|----------|:-------:|:-------:|-------------|
| Native MNT Transfers | ✅ | ✅ | Send/receive MNT tokens |
| OKX DEX Aggregator | ✅ | ✅ | DEX aggregation (requires API keys) |
| 1inch | ✅ | ✅ | DEX aggregation |
| Squid Router | ✅ | ✅ | Cross-chain swaps & bridging |
| OpenOcean | ✅ | ✅ | DEX aggregation |
| x402 Payments | ✅ | ✅ | HTTP 402 payment infrastructure |

### Mainnet Only (Not Deployed on Testnet)

| Protocol | Testnet | Mainnet | Description |
|----------|:-------:|:-------:|-------------|
| Lendle | ❌ | ✅ | Lending/borrowing (Aave fork) |
| Agni Finance | ❌ | ✅ | DEX (Uniswap V3 fork) |
| Merchant Moe | ❌ | ✅ | Liquidity Book DEX |
| mETH Protocol | ❌ | ✅ | Liquid staking |
| Uniswap V3 | ❌ | ✅ | DEX |

---

## Packages

### mantle-agent-kit
TypeScript SDK for DeFi protocols on Mantle Network.

```bash
npm install mantle-agent-kit-sdk
```

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

// For Testnet
const agentTestnet = new MNTAgentKit(privateKey, "testnet");

// For Mainnet
const agentMainnet = new MNTAgentKit(privateKey, "mainnet");
```

### x402-devkit
Complete SDK for monetizing APIs with HTTP 402 payments.

```bash
npm install x402-mantle-sdk
```

```typescript
import { x402 } from 'x402-mantle-sdk/server'

// For Testnet
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))

// For Mainnet
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  network: 'mantle'
}))
```

### create-x402-app
CLI tool for scaffolding x402 projects.

```bash
npx create-x402-app my-app
```

### mantle-devkit-mcp
MCP server for Mantle Network integration with Claude.

---

## Structure

```
packages/
├── mantle-agent-kit/    # DeFi Agent SDK
├── x402-devkit/         # x402 Payment SDK
├── create-x402-app/     # Project scaffolding CLI
├── mantle-devkit-mcp/   # MCP Server
└── README.md            # This file
```

---

## Token Addresses

### Mainnet (Chain ID: 5000)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9` | 6 |
| USDT | `0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE` | 6 |
| WMNT | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | 18 |
| mETH | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` | 18 |
| WETH | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` | 18 |

### Testnet - Sepolia (Chain ID: 5003)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9` | 6 |
| WMNT | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | 18 |
| mETH | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` | 18 |

### Block Explorers

- **Mainnet**: https://explorer.mantle.xyz
- **Testnet**: https://explorer.sepolia.mantle.xyz
