# @x402-devkit/sdk

> Complete SDK for monetizing APIs with HTTP 402 payments on Mantle Network

[![npm version](https://img.shields.io/npm/v/@x402-devkit/sdk)](https://www.npmjs.com/package/@x402-devkit/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mantle Network](https://img.shields.io/badge/Network-Mantle-blue)](https://mantle.xyz)

**@x402-devkit/sdk** enables developers to monetize APIs using HTTP 402 Payment Required status code with blockchain payments on Mantle Network. Protect your API routes, handle payments automatically, and track revenue—all with a few lines of code.

## ✨ Features

- 🚀 **Zero-Configuration Setup** - Get started in minutes
- 💰 **Automatic Payment Handling** - Seamless wallet integration
- 📊 **Real-Time Analytics** - Track endpoint usage and revenue
- 🔒 **Blockchain Verification** - On-chain payment validation
- 🎨 **Beautiful UI Components** - Ready-to-use React payment modals
- 🌐 **Multi-Token Support** - MNT, USDC, USDT, mETH, WMNT
- ⚡ **Ultra-Low Fees** - Gas costs under $0.001 on Mantle
- 🔄 **Auto Endpoint Tracking** - Endpoints appear in dashboard automatically

## 📦 Installation

```bash
npm install @x402-devkit/sdk
```

## 🚀 Quick Start

### 1. Create a Project

Visit the [x402 Dashboard](https://mantle-x402.vercel.app/dashboard) to create a project and get your `X402_APP_ID`.

### 2. Protect Your API Routes

```typescript
import { Hono } from 'hono'
import { x402 } from '@x402-devkit/sdk/server'

const app = new Hono()

// Set your project ID
process.env.X402_APP_ID = 'your-app-id-here'

// Protect any route with payment
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true  // Use mantle-sepolia for testing
}))

app.get('/api/premium', (c) => {
  return c.json({ data: 'Premium content unlocked!' })
})
```

### 3. Handle Payments on Client

```typescript
import { x402Fetch } from '@x402-devkit/sdk/client'

// Automatically handles 402 responses with payment modal
const response = await x402Fetch('https://api.example.com/api/premium')
const data = await response.json()
```

**That's it!** Your API now accepts blockchain payments. 🎉

## 📖 Documentation

### Server Usage

#### Basic Middleware

```typescript
import { x402 } from '@x402-devkit/sdk/server'

app.use('/api/data', x402({
  price: '0.001',
  token: 'MNT',
  network: 'mantle'  // or 'mantle-sepolia' for testnet
}))
```

#### Advanced Options

```typescript
app.use('/api/premium', x402({
  price: '0.001',
  token: 'USDC',
  network: 'mantle',
  endpoint: '/api/premium',  // For dashboard tracking
  method: 'GET',              // For dashboard tracking
  enableAnalytics: true       // Auto-track payments (default: true)
}))
```

#### Environment Variables

```env
# Required
X402_APP_ID=your-project-app-id

# Optional
X402_PLATFORM_URL=https://mantle-x402.vercel.app
```

### Client Usage

#### Automatic Payment Handling

```typescript
import { x402Fetch } from '@x402-devkit/sdk/client'

// Automatically intercepts 402 responses and shows payment modal
const response = await x402Fetch('https://api.example.com/api/premium')
const data = await response.json()
```

#### Custom Client Configuration

```typescript
import { x402Client } from '@x402-devkit/sdk/client'

const client = x402Client({
  autoRetry: true,
  autoSwitchNetwork: true,
  testnet: false
})

const response = await client.fetch('https://api.example.com/api/premium')
```

### React Components

#### Basic Payment Modal

```tsx
import { PaymentModal } from '@x402-devkit/sdk/client/react'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [request, setRequest] = useState(null)

  return (
    <PaymentModal
      request={request}
      isOpen={isOpen}
      onComplete={(payment) => {
        console.log('Payment successful:', payment.transactionHash)
        setIsOpen(false)
      }}
      onCancel={() => setIsOpen(false)}
    />
  )
}
```

#### Enhanced Payment Modal

```tsx
import { EnhancedPaymentModal } from '@x402-devkit/sdk/client/react'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [request, setRequest] = useState({
    amount: '0.001',
    token: 'MNT',
    network: 'mantle',
    recipient: '0x...',
    description: 'Premium API access',
    endpoint: '/api/premium-data'
  })

  return (
    <EnhancedPaymentModal
      request={request}
      isOpen={isOpen}
      onComplete={(payment) => {
        console.log('Paid:', payment.transactionHash)
        setIsOpen(false)
      }}
      onCancel={() => setIsOpen(false)}
      description="Premium API access"
      endpoint="/api/premium-data"
      simulation={false}  // Set to true for testing
    />
  )
}
```

## 🌐 Supported Networks

| Network | Chain ID | Status | Tokens |
|---------|----------|--------|--------|
| Mantle Mainnet | 5000 | ✅ Production | MNT, USDC, USDT, mETH, WMNT |
| Mantle Sepolia | 5003 | ✅ Testnet | MNT, USDC, mETH, WMNT |

## 💡 Use Cases

- **AI & LLM APIs** - Charge per token, per request, or per compute second
- **Data APIs** - Monetize datasets, market data, or proprietary information
- **Compute APIs** - Image processing, video transcoding, ML inference
- **Premium Content** - Articles, research, analysis with micropayments
- **IoT & Sensors** - Sell real-time sensor data with pay-per-read

## 📊 Dashboard & Analytics

All endpoints are automatically tracked in the [x402 Dashboard](https://mantle-x402.vercel.app/dashboard):

- **Automatic Endpoint Discovery** - Endpoints appear when first accessed
- **Real-Time Payment Tracking** - See payments as they happen
- **Revenue Analytics** - Track earnings per endpoint
- **Usage Statistics** - Monitor API usage patterns

## 🔧 API Reference

### Server Exports

```typescript
import {
  // Main middleware
  x402,
  
  // Payment verification
  verifyPayment,
  verifyPaymentOnChain,
  
  // Network utilities
  getNetworkConfig,
  getTokenConfig,
  registerCustomNetwork,
  registerCustomTokens,
  
  // Analytics
  logPayment,
  registerEndpoint,
  
  // Platform
  initializePlatform,
  getProjectConfig,
} from '@x402-devkit/sdk/server'
```

### Client Exports

```typescript
import {
  // Fetch with 402 handling
  x402Fetch,
  x402Client,
  
  // Wallet utilities
  connectWallet,
  detectWalletProvider,
  ensureNetwork,
  
  // Payment processing
  processPayment,
  
  // Constants
  TREASURY_ADDRESS,
  PLATFORM_FEE_BPS,
} from '@x402-devkit/sdk/client'
```

### React Exports

```typescript
import {
  PaymentModal,          // Basic payment modal
  EnhancedPaymentModal,  // Enhanced modal with success states
} from '@x402-devkit/sdk/client/react'
```

## 🏗️ Architecture

```
@x402-devkit/sdk
├── /server          # Server middleware (Hono, Express-compatible)
├── /client          # Client SDK (fetch, wallet integration)
└── /client/react    # React components (payment modals)
```

## 🔐 Security

- **On-Chain Verification** - All payments verified on blockchain
- **No Private Keys** - Wallet-based payments only
- **Idempotent Payments** - Duplicate transaction protection
- **Amount Tolerance** - Handles minor blockchain rounding

## 💰 Pricing & Fees

- **Platform Fee**: 0.5% (automatically split to Treasury)
- **Gas Costs**: < $0.001 per transaction on Mantle
- **No Hidden Fees**: Transparent fee structure

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Dashboard**: [https://mantle-x402.vercel.app](https://mantle-x402.vercel.app)
- **Documentation**: [https://mantle-x402.vercel.app/dashboard?tab=docs](https://mantle-x402.vercel.app/dashboard?tab=docs)
- **GitHub**: [https://github.com/x402-devkit/x402](https://github.com/x402-devkit/x402)
- **Mantle Network**: [https://mantle.xyz](https://mantle.xyz)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/x402-devkit/x402/issues)
- **Discord**: [Join our community](https://discord.gg/x402)
- **Email**: support@x402.dev

## 🙏 Acknowledgments

Built for [Mantle Network](https://mantle.xyz) - the fastest and cheapest Layer 2 for Ethereum.

---

**Made with ❤️ for the Mantle ecosystem**
