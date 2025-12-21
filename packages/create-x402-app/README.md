# create-x402-app

Create a new x402 pay-per-request API project with one command.

## Overview

`create-x402-app` is a CLI tool that scaffolds production-ready x402 projects with pre-configured examples, wallet integration, and payment handling. Get started with HTTP 402 payments on Mantle Network in minutes.

## Quick Start

```bash
npx create-x402-app my-app
cd my-app
npm run dev
```

## Installation

No installation required. Use `npx` to run the CLI directly:

```bash
npx create-x402-app [project-name]
```

## Usage

### Interactive Mode

Run without arguments to use interactive prompts:

```bash
npx create-x402-app
```

The CLI will prompt you for:
- Project name
- Project type (Fullstack or Backend only)
- Framework (Hono or Express)
- Package manager (npm, yarn, pnpm, bun)
- Whether to install dependencies

### Command Line Arguments

```bash
# Create project with specific name
npx create-x402-app my-api

# Specify project type and framework
npx create-x402-app my-api --fullstack --express
npx create-x402-app my-api --backend --hono

# Use specific package manager
npx create-x402-app my-api --bun
npx create-x402-app my-api --pnpm
npx create-x402-app my-api --yarn

# Skip dependency installation
npx create-x402-app my-api --skip-install
```

## Available Templates

The CLI provides 4 production-ready templates:

### Backend Templates

**backend-hono** - Standalone Hono API server
- Fast, lightweight Hono framework
- Web Standards based
- Minimal dependencies

**backend-express** - Standalone Express API server
- Popular Express.js framework
- Mature ecosystem
- Extensive middleware support

### Fullstack Templates

**fullstack-hono** - Next.js app with Hono API routes
- Next.js 16 with App Router
- Hono for API routes
- Complete frontend + backend

**fullstack-express** - Next.js app with Express-style API routes
- Next.js 16 with App Router
- Express-compatible API routes
- Complete frontend + backend

## What's Included

Each generated project includes:

- **x402-mantle-sdk** pre-installed and configured
- **TypeScript** configuration with strict mode
- **Tailwind CSS** for styling
- **Example API routes**:
  - `/api/info` - Free endpoint (no payment required)
  - `/api/premium` - Paid endpoint (0.001 MNT)
  - `/api/weather` - Paid endpoint (0.0005 MNT)
- **Demo frontend** with wallet connection UI
- **Payment modal** integration
- **Environment configuration** with `.env.example`
- **Git configuration** with `.gitignore`

## Getting Started

### 1. Get Your App ID

1. Visit the [x402 Dashboard](https://mantle-x402.vercel.app)
2. Connect your wallet
3. Create a new project
4. Copy your App ID

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your App ID:

```env
X402_APP_ID=your-app-id-here
X402_PLATFORM_URL=https://mantle-x402.vercel.app
```

### 3. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   │   ├── info/     # Free endpoint
│   │   │   ├── premium/  # Paid endpoint
│   │   │   └── weather/   # Paid endpoint
│   │   ├── page.tsx      # Demo frontend
│   │   └── layout.tsx    # Root layout
│   ├── components/        # UI components
│   └── lib/              # Utilities
├── public/               # Static assets
├── .env.example          # Environment template
└── package.json
```

## Next Steps

- Read the [x402 Documentation](https://mantle-x402.vercel.app/dashboard?tab=docs)
- Explore the [x402-mantle-sdk API Reference](https://www.npmjs.com/package/x402-mantle-sdk)
- Customize API routes and pricing
- Deploy to production

## Related Packages

- **x402-mantle-sdk** - Core SDK for HTTP 402 payments
  - [View on npm](https://www.npmjs.com/package/x402-mantle-sdk)
  - Server middleware, client SDK, and React components

## Resources

- [x402 Documentation](https://mantle-x402.vercel.app/dashboard?tab=docs)
- [x402 Dashboard](https://mantle-x402.vercel.app)
- [x402-mantle-sdk on npm](https://www.npmjs.com/package/x402-mantle-sdk)
- [Mantle Network](https://mantle.xyz)

## License

MIT
