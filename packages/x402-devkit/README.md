# @x402-devkit/sdk

Complete SDK for x402 paid APIs on Mantle Network. Monetize your APIs with HTTP 402 payments.

## Installation

```bash
npm install @x402-devkit/sdk
```

## Quick Start

### Server - Protect API Routes

```typescript
import { Hono } from 'hono'
import { x402 } from '@x402-devkit/sdk/server'

const app = new Hono()

// Protect route with payment (0.001 MNT)
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true  // Use mantle-sepolia for testing
}))

app.get('/api/premium', (c) => {
  return c.json({ data: 'Premium content' })
})
```

### Client - Handle Payments

```typescript
import { x402Fetch } from '@x402-devkit/sdk/client'

// Automatically handles 402 responses with payment modal
const response = await x402Fetch('https://api.example.com/api/premium')
const data = await response.json()
```

### React - Payment Modal Component

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
        console.log('Paid:', payment.transactionHash)
        setIsOpen(false)
      }}
      onCancel={() => setIsOpen(false)}
    />
  )
}
```

## Features

- **Server Middleware**: Hono middleware for payment-gated routes
- **Client SDK**: Automatic 402 handling with wallet integration
- **React Components**: Ready-to-use payment modal
- **Mantle Network**: Native support for Mantle mainnet and testnet
- **Multiple Tokens**: Support for MNT, USDC, USDT, mETH, WMNT
- **Custom Networks**: Register custom networks and tokens
- **0.5% Platform Fee**: Automatic fee splitting to Treasury

## Environment Variables

### Server
```env
X402_APP_ID=your-app-id
X402_PLATFORM_URL=https://api.x402.dev  # Optional
```

## Networks

| Network | Chain ID | Token |
|---------|----------|-------|
| Mantle Mainnet | 5000 | MNT |
| Mantle Sepolia | 5003 | MNT |

## API Reference

### Server Exports

```typescript
import {
  x402,                    // Main middleware
  verifyPayment,           // Manual payment verification
  getNetworkConfig,        // Get network configuration
  registerCustomNetwork,   // Register custom network
} from '@x402-devkit/sdk/server'
```

### Client Exports

```typescript
import {
  x402Fetch,               // Enhanced fetch with 402 handling
  x402Client,              // Client factory
  connectWallet,           // Connect wallet
  processPayment,          // Process payment manually
  TREASURY_ADDRESS,        // Treasury contract address
} from '@x402-devkit/sdk/client'
```

### React Exports

```typescript
import { PaymentModal } from '@x402-devkit/sdk/client/react'
```

## Treasury

Platform fee (0.5%) is automatically sent to the Treasury contract:
- **Address**: `0xB27705342ACE73736AE490540Ea031cc06C3eF49`
- **Network**: Mantle Sepolia

## License

MIT
# x-402-mantle-sdk
