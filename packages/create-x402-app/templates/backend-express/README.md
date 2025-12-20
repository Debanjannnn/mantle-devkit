# x402 Backend - Express

A robust API server with pay-per-request endpoints using x402 on Mantle Network.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your App ID from https://mantle-x402.vercel.app

# Start development server
npm run dev
```

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /` | Free | API information |
| `GET /api/premium` | 0.001 MNT | Premium content |
| `GET /api/weather` | 0.0005 MNT | Weather data |

## Adding New Paid Endpoints

```typescript
import { x402Express } from 'x402-mantle-sdk/server'

app.get(
  '/api/my-endpoint',
  x402Express({ price: '0.01', token: 'MNT', testnet: true }),
  (req, res) => {
    // Access payment info via req.x402
    console.log('Payment verified:', req.x402.transactionHash)
    res.json({ data: 'Your premium content' })
  }
)
```

## Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Learn More

- [x402 Documentation](https://mantle-x402.vercel.app)
- [Express Documentation](https://expressjs.com)
