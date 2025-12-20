# create-x402-app

Create a new x402 pay-per-request API project with one command.

## Quick Start

```bash
npx create-x402-app my-app
cd my-app
npm run dev
```

## Usage

### Interactive Mode

```bash
npx create-x402-app
```

This will prompt you for:
- Project name
- Package manager (npm, yarn, pnpm, bun)
- Whether to install dependencies

### With Arguments

```bash
# Create project with specific name
npx create-x402-app my-api

# Use specific package manager
npx create-x402-app my-api --bun
npx create-x402-app my-api --pnpm
npx create-x402-app my-api --yarn

# Skip dependency installation
npx create-x402-app my-api --skip-install
```

## What's Included

The generated project includes:

- **Next.js 16** with App Router
- **x402-mantle-sdk** for HTTP 402 payments
- **TypeScript** configuration
- **Tailwind CSS** for styling
- **Example API routes**:
  - `/api/info` - Free endpoint
  - `/api/premium` - Paid endpoint (0.001 MNT)
  - `/api/weather` - Paid endpoint (0.0005 MNT)
- **Demo frontend** with wallet connection

## After Creating

1. **Get your App ID**
   - Visit [https://mantle-x402.vercel.app](https://mantle-x402.vercel.app)
   - Connect your wallet
   - Create a project
   - Copy your App ID

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your App ID
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

## Learn More

- [x402 Documentation](https://mantle-x402.vercel.app)
- [x402-mantle-sdk on npm](https://www.npmjs.com/package/x402-mantle-sdk)

## License

MIT
