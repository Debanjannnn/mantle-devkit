# x402 Mantle SDK

Complete SDK for monetizing APIs with HTTP 402 payments on Mantle Network. Build payment-gated APIs that require blockchain payments before access.

## Overview

x402 Mantle SDK enables you to:
- **Monetize APIs**: Protect API routes with blockchain payments
- **HTTP 402 Payments**: Use the standard HTTP 402 Payment Required status code
- **Mantle Network**: Native support for Mantle mainnet and testnet
- **Multiple Tokens**: Support for MNT, USDC, USDT, mETH, WMNT
- **Automatic Fee Splitting**: 0.5% platform fee automatically sent to Treasury
- **Easy Integration**: Simple middleware for servers, automatic payment handling for clients

## Table of Contents

- [Getting Started](#getting-started)
- [Dashboard & Project Setup](#dashboard--project-setup)
- [Server Usage](#server-usage)
- [Client Usage](#client-usage)
- [React Components](#react-components)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Networks & Tokens](#networks--tokens)

## Getting Started

### Installation

```bash
npm install @x402-devkit/sdk
```

### Quick Start

1. **Create a project** in the dashboard to get your `projectId`
2. **Protect your API routes** with the server middleware
3. **Handle payments** on the client side automatically

## Dashboard & Project Setup

### Step 1: Access the Dashboard

Navigate to the dashboard at `/dashboard` and connect your wallet.

### Step 2: Create a Project

1. Click the **"Create"** button in the dashboard
2. Fill in the project details:
   - **Project Name**: A descriptive name for your project
   - **Payout Wallet**: The wallet address where payments will be sent (defaults to your connected wallet)
   - **Network**: Currently supports Mantle Sepolia (testnet)

```typescript
// Example: Creating a project via API
const project = await createProject({
  name: "My Premium API",
  payTo: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Your wallet address
  network: "mantle" // or "mantle-sepolia" for testnet
})

console.log("Project ID:", project.projectId)
console.log("App ID:", project.appId) // Hashed version used in SDK
```

### Step 3: Get Your Project ID

After creating a project, you'll receive:
- **Project ID** (`projectId`): The original project identifier (e.g., `proj_abc123xyz`)
- **App ID** (`appId`): The hashed version used by the SDK

**Important**: Save your `projectId` securely. The dashboard shows the `appId` (hashed version) for security.

### Step 4: Configure Environment Variables

Set your project ID as an environment variable:

```bash
# .env
X402_APP_ID=your-app-id-here
X402_PLATFORM_URL=https://mantle-x402.vercel.app  # Optional, defaults to https://mantle-x402.vercel.app
```

## Server Usage

### Basic Setup with Hono

```typescript
import { Hono } from 'hono'
import { x402 } from '@x402-devkit/sdk/server'

const app = new Hono()

// Initialize platform with your project ID
// This is done automatically via X402_APP_ID environment variable
// Or manually:
import { initializePlatform } from '@x402-devkit/sdk/server'
await initializePlatform({
  appId: process.env.X402_APP_ID!,
  platformUrl: process.env.X402_PLATFORM_URL // Optional
})

// Protect a route with payment (0.001 MNT)
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true  // Use mantle-sepolia for testing
}))

app.get('/api/premium', (c) => {
  return c.json({ 
    data: 'Premium content',
    message: 'Payment verified successfully!'
  })
})

// Start server
export default {
  port: 3000,
  fetch: app.fetch,
}
```

### Express.js Integration

```typescript
import express from 'express'
import { processPaymentMiddleware } from '@x402-devkit/sdk/server'

const app = express()

app.use('/api/premium', async (req, res, next) => {
  const result = await processPaymentMiddleware(
    {
      price: '0.001',
      token: 'MNT',
      testnet: true
    },
    req.headers
  )

  if (!result.allowed) {
    if (result.paymentRequired) {
      return res.status(402).json(result.paymentRequired.body)
    }
    return res.status(result.error?.status || 500).json({
      error: result.error?.message
    })
  }

  next()
})

app.get('/api/premium', (req, res) => {
  res.json({ data: 'Premium content' })
})
```

### Next.js API Routes

```typescript
// app/api/premium/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { processPaymentMiddleware } from '@x402-devkit/sdk/server'

export async function GET(request: NextRequest) {
  const result = await processPaymentMiddleware(
    {
      price: '0.001',
      token: 'MNT',
      testnet: true
    },
    request.headers
  )

  if (!result.allowed) {
    if (result.paymentRequired) {
      return NextResponse.json(
        result.paymentRequired.body,
        { status: 402, headers: result.paymentRequired.headers }
      )
    }
    return NextResponse.json(
      { error: result.error?.message },
      { status: result.error?.status || 500 }
    )
  }

  return NextResponse.json({ data: 'Premium content' })
}
```

### Manual Payment Verification

```typescript
import { verifyPayment, extractPaymentReceipt } from '@x402-devkit/sdk/server'

// Extract payment receipt from headers
const receipt = extractPaymentReceipt(request.headers)

if (receipt) {
  // Verify payment on blockchain
  const verification = await verifyPayment(
    receipt,
    { payTo: '0x...', network: 'mantle-sepolia' },
    '0.001', // Expected amount
    'MNT',   // Expected token
    true     // Verify on-chain
  )

  if (verification.valid) {
    console.log('Payment verified:', verification.transactionHash)
  }
}
```

## Client Usage

### Basic Fetch with Auto-Payment

```typescript
import { x402Fetch } from '@x402-devkit/sdk/client'

// Automatically handles 402 responses with payment modal
const response = await x402Fetch('https://api.example.com/api/premium')
const data = await response.json()

console.log('Data:', data)
```

### Custom Client Instance

```typescript
import { X402Client } from '@x402-devkit/sdk/client'

const client = new X402Client({
  autoRetry: true, // Automatically retry after payment
  testnet: true    // Use testnet
})

await client.initialize() // Initialize wallet connection

const response = await client.fetch('https://api.example.com/api/premium')
const data = await response.json()
```

### Vanilla JavaScript Payment Modal

```typescript
import { createVanillaPaymentModal } from '@x402-devkit/sdk/client'

// Handle 402 response manually
const response = await fetch('https://api.example.com/api/premium')

if (response.status === 402) {
  const paymentRequest = {
    amount: response.headers.get('X-402-Amount')!,
    token: response.headers.get('X-402-Token')!,
    network: response.headers.get('X-402-Network')!,
    recipient: response.headers.get('X-402-Recipient')!
  }

  const payment = await createVanillaPaymentModal(paymentRequest)
  
  if (payment) {
    // Retry request with payment headers
    const retryResponse = await fetch('https://api.example.com/api/premium', {
      headers: {
        'X-402-Transaction-Hash': payment.transactionHash
      }
    })
    const data = await retryResponse.json()
  }
}
```

### Manual Payment Processing

```typescript
import { processPayment, connectWallet } from '@x402-devkit/sdk/client'

// Connect wallet
const wallet = await connectWallet()

// Process payment
const payment = await processPayment({
  amount: '0.001',
  token: 'MNT',
  network: 'mantle-sepolia',
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
})

console.log('Transaction hash:', payment.transactionHash)

// Use payment in request
const response = await fetch('https://api.example.com/api/premium', {
  headers: {
    'X-402-Transaction-Hash': payment.transactionHash
  }
})
```

## React Components

### Payment Modal Component

```tsx
import { useState } from 'react'
import { PaymentModal } from '@x402-devkit/sdk/client/react'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState(null)

  const handleApiCall = async () => {
    try {
      const response = await fetch('https://api.example.com/api/premium')
      
      if (response.status === 402) {
        // Extract payment request from headers
        setPaymentRequest({
          amount: response.headers.get('X-402-Amount')!,
          token: response.headers.get('X-402-Token')!,
          network: response.headers.get('X-402-Network')!,
          recipient: response.headers.get('X-402-Recipient')!
        })
        setIsOpen(true)
      } else {
        const data = await response.json()
        console.log('Data:', data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handlePaymentComplete = async (payment) => {
    console.log('Payment completed:', payment.transactionHash)
    setIsOpen(false)
    
    // Retry the original request with payment
    const response = await fetch('https://api.example.com/api/premium', {
      headers: {
        'X-402-Transaction-Hash': payment.transactionHash
      }
    })
    const data = await response.json()
    console.log('Data:', data)
  }

  return (
    <div>
      <button onClick={handleApiCall}>Call Premium API</button>
      
      <PaymentModal
        request={paymentRequest}
        isOpen={isOpen}
        onComplete={handlePaymentComplete}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  )
}
```

### Using x402Fetch Hook

```tsx
import { useState, useEffect } from 'react'
import { x402Fetch } from '@x402-devkit/sdk/client'

function PremiumContent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await x402Fetch('https://api.example.com/api/premium')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!data) return <div>No data</div>

  return <div>{JSON.stringify(data, null, 2)}</div>
}
```

## API Reference

### Server Exports

```typescript
import {
  // Main middleware
  x402,
  
  // Platform configuration
  initializePlatform,
  getProjectConfig,
  clearCache,
  
  // Payment verification
  verifyPayment,
  extractPaymentReceipt,
  
  // Blockchain verification
  verifyPaymentOnChain,
  
  // Middleware utilities
  processPaymentMiddleware,
  
  // Network utilities
  getNetworkConfig,
  getTokenConfig,
  registerCustomNetwork,
  registerCustomTokens,
} from '@x402-devkit/sdk/server'
```

### Client Exports

```typescript
import {
  // Core client
  x402Client,
  x402Fetch,
  X402Client,
  
  // Payment modal
  createPaymentModal,
  createVanillaPaymentModal,
  
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
import { PaymentModal } from '@x402-devkit/sdk/client/react'
```

## Configuration

### Environment Variables

#### Server

```bash
# Required: Your project's app ID (from dashboard)
X402_APP_ID=your-app-id-here

# Optional: Platform API URL (defaults to production)
X402_PLATFORM_URL=https://api.x402.dev
```

#### Client

No environment variables required. Configuration is done programmatically.

### Middleware Options

```typescript
interface X402Options {
  price: string              // Payment amount (e.g., "0.001")
  token: string              // Token symbol (e.g., "MNT", "USDC")
  network?: string           // Network ID (defaults to project network)
  rpcUrl?: string            // Custom RPC URL
  testnet?: boolean          // Use testnet (shorthand)
  customNetwork?: {          // Custom network configuration
    chainId: number
    rpcUrl: string
  }
  customTokens?: {           // Custom token configurations
    [tokenSymbol: string]: {
      address: string
      decimals: number
    }
  }
}
```

## Networks & Tokens

### Supported Networks

| Network | Chain ID | Environment |
|---------|----------|-------------|
| Mantle Mainnet | 5000 | Production |
| Mantle Sepolia | 5003 | Testnet |

### Supported Tokens

| Token | Symbol | Decimals |
|-------|--------|----------|
| Mantle | MNT | 18 |
| USD Coin | USDC | 6 |
| Tether USD | USDT | 6 |
| Mantle ETH | mETH | 18 |
| Wrapped Mantle | WMNT | 18 |

### Custom Networks

```typescript
import { registerCustomNetwork } from '@x402-devkit/sdk/server'

registerCustomNetwork('my-network', {
  chainId: 12345,
  rpcUrl: 'https://my-rpc.example.com'
})
```

### Custom Tokens

```typescript
import { registerCustomTokens } from '@x402-devkit/sdk/server'

registerCustomTokens('mantle-sepolia', {
  'MYTOKEN': {
    address: '0x...',
    decimals: 18
  }
})
```

## Treasury & Fees

### Platform Fee

- **Fee Rate**: 0.5% (50 basis points)
- **Treasury Address**: `0xB27705342ACE73736AE490540Ea031cc06C3eF49`
- **Network**: Mantle Sepolia (Chain ID: 5003)

The platform fee is automatically deducted from each payment and sent to the Treasury contract. The remaining amount goes to your payout wallet.

### Fee Calculation Example

```typescript
// Payment: 1.0 MNT
// Platform fee: 1.0 * 0.005 = 0.005 MNT → Treasury
// Your payout: 1.0 - 0.005 = 0.995 MNT → Your wallet
```

## Examples

### Complete Server Example

```typescript
import { Hono } from 'hono'
import { x402 } from '@x402-devkit/sdk/server'

const app = new Hono()

// Free endpoint
app.get('/api/public', (c) => {
  return c.json({ message: 'This is free' })
})

// Premium endpoint - requires 0.001 MNT
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))

app.get('/api/premium', (c) => {
  return c.json({ 
    message: 'Premium content',
    data: { /* ... */ }
  })
})

// Different pricing for different endpoints
app.use('/api/ultra-premium', x402({
  price: '0.01',
  token: 'USDC',
  testnet: true
}))

app.get('/api/ultra-premium', (c) => {
  return c.json({ message: 'Ultra premium content' })
})

export default app
```

### Complete Client Example

```typescript
import { x402Fetch } from '@x402-devkit/sdk/client'

async function fetchPremiumData() {
  try {
    // x402Fetch automatically handles:
    // 1. Detecting 402 responses
    // 2. Opening payment modal
    // 3. Processing payment
    // 4. Retrying request with payment proof
    const response = await x402Fetch('https://api.example.com/api/premium')
    const data = await response.json()
    
    console.log('Premium data:', data)
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
```

### React App Example

```tsx
import { useState } from 'react'
import { x402Fetch } from '@x402-devkit/sdk/client'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFetch = async () => {
    setLoading(true)
    try {
      const response = await x402Fetch('https://api.example.com/api/premium')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Premium Data'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
```

## Troubleshooting

### Common Issues

1. **"Project not found"**
   - Ensure `X402_APP_ID` is set correctly
   - Verify the project exists in the dashboard
   - Check that you're using the `appId` (hashed), not `projectId`

2. **Payment verification fails**
   - Ensure the payment transaction has enough confirmations
   - Check that the payment amount and token match exactly
   - Verify the network matches (mainnet vs testnet)

3. **Wallet connection issues**
   - Ensure MetaMask or another EIP-1193 wallet is installed
   - Check that the correct network is selected
   - Verify wallet permissions are granted

## License

MIT

## Support

- **Documentation**: [https://x402.dev/docs](https://x402.dev/docs)
- **GitHub**: [https://github.com/x402-devkit/x402](https://github.com/x402-devkit/x402)
- **Issues**: [https://github.com/x402-devkit/x402/issues](https://github.com/x402-devkit/x402/issues)


