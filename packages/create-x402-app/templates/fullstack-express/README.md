# x402 Starter Template

A production-ready Next.js boilerplate for building **pay-per-request APIs** using the HTTP 402 protocol on Mantle Network.

## What is x402?

x402 implements the [HTTP 402 Payment Required](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402) status code to enable native payments for API access. When a client requests a paid endpoint without payment, the server returns a 402 response with payment details. After payment, the client retries with the transaction hash to access the content.

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-repo/x402-starter.git
cd x402-starter
npm install
```

### 2. Get Your App ID

1. Visit the [x402 Dashboard](https://mantle-x402.vercel.app) or [Documentation](https://mantle-x402.vercel.app/dashboard?tab=docs)
2. Connect your wallet
3. Create a new project
4. Copy your **App ID**

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
X402_APP_ID=your_app_id_here
X402_PLATFORM_URL=https://mantle-x402.vercel.app
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
x402-starter/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── info/route.ts       # Free endpoint (no payment)
│   │   │   ├── premium/route.ts    # Paid endpoint (0.001 MNT)
│   │   │   └── weather/route.ts    # Paid endpoint (0.0005 MNT)
│   │   ├── page.tsx                # Demo frontend
│   │   └── layout.tsx              # Root layout
│   ├── components/                 # UI components
│   └── lib/                        # Utilities
├── .env.example                    # Environment template
└── package.json
```

## API Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/info` | Free | API information |
| `GET /api/premium` | 0.001 MNT | Premium content |
| `GET /api/weather` | 0.0005 MNT | Weather data |

## Creating Paid Endpoints

### Basic Example

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { processPaymentMiddleware, initializePlatform } from 'x402-mantle-sdk/server'

let initialized = false

export async function GET(request: NextRequest) {
  // Initialize once
  if (!initialized) {
    await initializePlatform()
    initialized = true
  }

  // Convert headers
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  // Check payment
  const result = await processPaymentMiddleware(
    { price: '0.01', token: 'MNT', testnet: true },
    headers
  )

  // Return 402 if payment required
  if (result.paymentRequired) {
    const response = NextResponse.json(result.paymentRequired.body, { status: 402 })
    Object.entries(result.paymentRequired.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Return content if payment verified
  if (result.allowed) {
    return NextResponse.json({
      success: true,
      data: 'Your premium content here'
    })
  }

  return NextResponse.json({ error: 'Error' }, { status: 500 })
}
```

### Payment Options

```typescript
const options = {
  price: '0.001',           // Amount to charge
  token: 'MNT',             // Token (MNT, USDC, USDT)
  testnet: true,            // Use Mantle Sepolia (false for mainnet)
  network: 'mantle-sepolia' // Or 'mantle' for mainnet
}
```

## Client-Side Integration

### Using the PaymentModal Component

```tsx
import { PaymentModal } from 'x402-mantle-sdk/client/react'

function MyComponent() {
  const [showModal, setShowModal] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState(null)

  const fetchPaidEndpoint = async () => {
    const res = await fetch('/api/premium')

    if (res.status === 402) {
      // Extract payment details from response
      const body = await res.json()
      setPaymentRequest({
        amount: body.amount,
        token: body.token,
        network: body.network,
        recipient: body.recipient,
        chainId: body.chainId,
      })
      setShowModal(true)
    }
  }

  const handlePaymentComplete = async (payment) => {
    // Retry with transaction hash
    const res = await fetch('/api/premium', {
      headers: {
        'X-402-Transaction-Hash': payment.transactionHash
      }
    })
    const data = await res.json()
    console.log('Premium data:', data)
  }

  return (
    <>
      <button onClick={fetchPaidEndpoint}>Get Premium Data</button>

      {paymentRequest && (
        <PaymentModal
          request={paymentRequest}
          isOpen={showModal}
          onComplete={handlePaymentComplete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}
```

### Using x402Fetch (Auto-handles payments)

```typescript
import { x402Fetch } from 'x402-mantle-sdk/client'

// Automatically shows payment modal when 402 is returned
const response = await x402Fetch('/api/premium')
const data = await response.json()
```

## HTTP 402 Protocol

### Request Flow

```
1. Client requests paid endpoint
   GET /api/premium

2. Server returns 402 with payment details
   HTTP/1.1 402 Payment Required
   X-402-Amount: 0.001
   X-402-Token: MNT
   X-402-Network: mantle-sepolia
   X-402-Recipient: 0x...

3. Client makes payment on-chain

4. Client retries with transaction hash
   GET /api/premium
   X-402-Transaction-Hash: 0x...

5. Server verifies payment and returns content
   HTTP/1.1 200 OK
   { "data": "Premium content" }
```

## Supported Networks

| Network | Chain ID | Environment |
|---------|----------|-------------|
| Mantle | 5000 | Production |
| Mantle Sepolia | 5003 | Testnet |

## Supported Tokens

| Token | Mainnet | Testnet |
|-------|---------|---------|
| MNT | Native | Native |
| USDC | 0x09Bc4E... | 0x09Bc4E... |
| USDT | 0x201EBa... | - |

## Testing

1. Install [MetaMask](https://metamask.io/)
2. Add Mantle Sepolia network:
   - RPC: `https://rpc.sepolia.mantle.xyz`
   - Chain ID: `5003`
   - Symbol: `MNT`
3. Get test MNT from [Mantle Faucet](https://faucet.sepolia.mantle.xyz/)
4. Connect wallet and try paid endpoints

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard:
- `X402_APP_ID`
- `X402_PLATFORM_URL`

### Other Platforms

Works with any Node.js hosting:
- Railway
- Render
- AWS Lambda
- Google Cloud Run

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `X402_APP_ID` | Yes | Your project App ID from the dashboard |
| `X402_PLATFORM_URL` | Yes | Platform URL (default: https://mantle-x402.vercel.app) |

## Troubleshooting

### "X402_APP_ID is required"

Make sure your `.env` file exists and contains a valid App ID.

### Payment not verifying

1. Wait for transaction confirmation (~3 seconds)
2. Check that the transaction was successful on block explorer
3. Ensure the amount matches exactly

### Network mismatch

Make sure your wallet is on the same network as configured in the endpoint (testnet vs mainnet).

## Resources

- [x402 Documentation](https://mantle-x402.vercel.app/dashboard?tab=docs)
- [x402 Dashboard](https://mantle-x402.vercel.app)
- [x402-mantle-sdk on npm](https://www.npmjs.com/package/x402-mantle-sdk)
- [Mantle Network](https://www.mantle.xyz/)
- [Mantle Faucet](https://faucet.sepolia.mantle.xyz/)

## License

MIT
