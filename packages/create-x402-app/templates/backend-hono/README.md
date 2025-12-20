# x402 Backend - Hono

A lightweight API server with pay-per-request endpoints using x402 on Mantle Network.

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
import { x402 } from 'x402-mantle-sdk/server'

// Add middleware before the route handler
app.use('/api/my-endpoint', x402({
  price: '0.01',
  token: 'MNT',
  testnet: true
}))

app.get('/api/my-endpoint', (c) => {
  return c.json({ data: 'Your premium content' })
})
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
- [Hono Documentation](https://hono.dev)
