# x402 DevKit Packages

This directory contains the npm packages for x402 DevKit.

## @x402-devkit/sdk

Complete SDK for x402 paid APIs on Mantle Network.

**Install:**
```bash
npm install @x402-devkit/sdk
```

**Server - Protect Routes:**
```typescript
import { x402 } from '@x402-devkit/sdk/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))
```

**Client - Handle Payments:**
```typescript
import { x402Fetch } from '@x402-devkit/sdk/client'

const response = await x402Fetch('https://api.example.com/api/premium')
```

**React - Payment Modal:**
```tsx
import { PaymentModal } from '@x402-devkit/sdk/client/react'

<PaymentModal
  request={request}
  isOpen={isOpen}
  onComplete={handleComplete}
  onCancel={handleCancel}
/>
```

## Development

```bash
cd x402-devkit
bun install
bun run build
```

## Publishing

```bash
cd x402-devkit
npm login
npm publish --access public
```

## Structure

```
packages/
├── x402-devkit/    # Unified SDK package
├── README.md       # This file
└── PUBLISHING.md   # Publishing guide
```
