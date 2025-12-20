"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowLeft, Copy, Check } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"

interface DocsTabProps {
  currentPage: number
  setCurrentPage: (page: number) => void
  selectedDoc: number | null
  setSelectedDoc: (doc: number | null) => void
}

const DOCS = [
  {
    id: 1,
    title: "Getting Started",
    shortContent: "Learn how to set up x402 and create your first paid API endpoint.",
    fullContent: `# Getting Started with x402

x402 is the complete toolkit for building paid APIs on Mantle Network. Get started in minutes with just three lines of code.

## Quick Start Options

### Option 1: Use the CLI (Recommended)

The fastest way to get started is using the \`create-x402-app\` CLI tool:

\`\`\`bash
npx create-x402-app my-api
cd my-api
npm run dev
\`\`\`

This creates a fully configured Next.js project with:
- Example API routes (free and paid)
- Wallet connection UI
- Payment modal integration
- TypeScript configuration

### Option 2: Manual Installation

If you prefer to set up manually:

\`\`\`bash
npm install x402-mantle-sdk
\`\`\`

## Quick Start

### Server Setup

\`\`\`typescript
import { x402 } from 'x402-mantle-sdk/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true  // Use mantle-sepolia for testing
}))
\`\`\`

### Client Integration

\`\`\`typescript
import { x402Fetch } from 'x402-mantle-sdk/client'

const response = await x402Fetch('https://api.example.com/api/premium')
\`\`\`

That's it! Your API now accepts payments.

## Packages

x402 consists of two main packages:

1. **\`x402-mantle-sdk\`** (v0.2.5+) - The core SDK for server and client
   - Install: \`npm install x402-mantle-sdk\`
   - Exports: \`/server\`, \`/client\`, \`/client/react\`
   - [View on npm](https://www.npmjs.com/package/x402-mantle-sdk)

2. **\`create-x402-app\`** (v0.1.4+) - CLI tool for scaffolding projects
   - Use: \`npx create-x402-app my-app\`
   - Creates ready-to-use starter templates
   - [View on npm](https://www.npmjs.com/package/create-x402-app)`,
  },
  {
    id: 2,
    title: "API Reference",
    shortContent: "Complete reference for all x402 server and client methods.",
    fullContent: `# API Reference

## Installation

\`\`\`bash
npm install x402-mantle-sdk@latest
\`\`\`

**Current version:** v0.2.5+

**Package:** [x402-mantle-sdk on npm](https://www.npmjs.com/package/x402-mantle-sdk)

## Server SDK

Import from \`x402-mantle-sdk/server\`:

### x402(options) - Hono Middleware

Main middleware function for Hono framework.

\`\`\`typescript
import { x402 } from 'x402-mantle-sdk/server'

app.use('/api/premium', x402({
  price: '0.001',        // Price in tokens
  token: 'MNT',         // Token symbol (MNT, USDC, USDT, mETH, WMNT)
  testnet: true,        // Use mantle-sepolia (false for mainnet)
  network: 'mantle-sepolia'  // Or 'mantle' for mainnet
}))
\`\`\`

### x402Express(options) - Express Middleware

Express.js middleware adapter.

\`\`\`typescript
import { x402Express } from 'x402-mantle-sdk/server'

app.use('/api/premium', x402Express({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))
\`\`\`

### processPaymentMiddleware(options, headers) - Framework Agnostic

Use with any framework (Next.js, etc.).

\`\`\`typescript
import { processPaymentMiddleware } from 'x402-mantle-sdk/server'

const result = await processPaymentMiddleware(
  { price: '0.001', token: 'MNT', testnet: true },
  request.headers
)
\`\`\`

## Client SDK

Import from \`x402-mantle-sdk/client\`:

### x402Fetch(url, options?)

Fetch wrapper that handles payments automatically.

\`\`\`typescript
import { x402Fetch } from 'x402-mantle-sdk/client'

const response = await x402Fetch('https://api.example.com/api/premium')
const data = await response.json()
\`\`\`

### X402Client

Configurable client instance.

\`\`\`typescript
import { X402Client } from 'x402-mantle-sdk/client'

const client = new X402Client({
  autoRetry: true,
  testnet: true
})

await client.initialize()
const response = await client.fetch('/api/premium')
\`\`\`

## React Components

Import from \`x402-mantle-sdk/client/react\`:

### PaymentModal Component

React component for payment UI.

\`\`\`tsx
import { PaymentModal } from 'x402-mantle-sdk/client/react'

<PaymentModal
  request={paymentRequest}
  isOpen={boolean}
  onComplete={callback}
  onCancel={callback}
/>
\`\`\``,
  },
  {
    id: 3,
    title: "CLI Tool: create-x402-app",
    shortContent: "Scaffold a new x402 project with one command using the CLI tool.",
    fullContent: `# create-x402-app CLI Tool

The fastest way to get started with x402 is using the \`create-x402-app\` CLI tool. It creates a fully configured project with examples and best practices.

## Quick Start

\`\`\`bash
npx create-x402-app my-api
cd my-api
npm run dev
\`\`\`

## Usage

### Interactive Mode

\`\`\`bash
npx create-x402-app
\`\`\`

This will prompt you for:
- Project name
- Project type (Fullstack or Backend only)
- Framework (Hono or Express)
- Package manager (npm, yarn, pnpm, bun)
- Whether to install dependencies

### With Arguments

\`\`\`bash
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
\`\`\`

## Available Templates

The CLI provides 4 templates:

1. **backend-hono** - Standalone Hono API server
2. **backend-express** - Standalone Express API server
3. **fullstack-hono** - Next.js app with Hono API routes
4. **fullstack-express** - Next.js app with Express-style API routes

## What's Included

Each template includes:
- **x402-mantle-sdk** pre-installed
- **TypeScript** configuration
- **Example API routes** (free and paid endpoints)
- **Wallet connection** UI
- **Payment modal** integration
- **Tailwind CSS** for styling

## After Creating

1. **Get your App ID**
   - Visit the [x402 Dashboard](https://mantle-x402.vercel.app)
   - Connect your wallet
   - Create a project
   - Copy your App ID

2. **Configure environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your App ID
   \`\`\`

3. **Start development**
   \`\`\`bash
   npm run dev
   \`\`\`

## Learn More

- [x402 Documentation](https://mantle-x402.vercel.app/dashboard?tab=docs)
- [x402-mantle-sdk on npm](https://www.npmjs.com/package/x402-mantle-sdk)
- [create-x402-app on npm](https://www.npmjs.com/package/create-x402-app)`,
  },
  {
    id: 4,
    title: "Payment Integration",
    shortContent: "Guide to integrating x402 payments into your existing API infrastructure.",
    fullContent: `# Payment Integration Guide

## Step-by-Step Integration

### 1. Install Dependencies

\`\`\`bash
npm install x402-mantle-sdk
\`\`\`

### 2. Protect Your Endpoint

Wrap your existing API route with x402 middleware:

\`\`\`typescript
import { x402 } from 'x402-mantle-sdk/server'

// Before
app.get('/api/data', (req, res) => {
  res.json({ data: 'premium content' })
})

// After
app.use('/api/data', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))
app.get('/api/data', (req, res) => {
  res.json({ data: 'premium content' })
})
\`\`\`

### 3. Update Client Code

Replace your fetch calls with x402Fetch:

\`\`\`typescript
// Before
const response = await fetch('/api/data')

// After
import { x402Fetch } from 'x402-mantle-sdk/client'
const response = await x402Fetch('/api/data')
\`\`\`

The payment flow is handled automatically!`,
  },
  {
    id: 5,
    title: "Wallet Configuration",
    shortContent: "Configure payout wallets and manage payment settings.",
    fullContent: `# Wallet Configuration

## Setting Up Payout Wallets

### Create a Project

1. Go to your dashboard
2. Click "Create New Project"
3. Enter your project name
4. Set your payout wallet address
5. Copy your App ID

### Using Your App ID

Set the \`X402_APP_ID\` environment variable:

\`\`\`bash
# .env
X402_APP_ID=your-app-id-here
X402_PLATFORM_URL=https://mantle-x402.vercel.app
\`\`\`

The SDK will automatically use this App ID:

\`\`\`typescript
import { x402 } from 'x402-mantle-sdk/server'

// App ID is read from process.env.X402_APP_ID
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))
\`\`\`

### Updating Payout Wallet

You can update your payout wallet from the dashboard at any time. All future payments will be sent to the new address.

## Best Practices

- Use a dedicated wallet for payouts
- Keep your private keys secure
- Test with small amounts first
- Monitor your dashboard regularly`,
  },
  {
    id: 6,
    title: "Network Setup",
    shortContent: "Connect to Mantle network and configure your environment.",
    fullContent: `# Network Setup

## Mantle Network Configuration

### Network Details

- **Network Name**: Mantle Sepolia Testnet
- **Chain ID**: 5003
- **RPC URL**: https://rpc.sepolia.mantle.xyz
- **Explorer**: https://explorer.sepolia.mantle.xyz

### Adding to MetaMask

1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Enter the network details above
4. Save and switch to Mantle Sepolia

### Environment Variables

\`\`\`.env
DATABASE_URL=your_database_url
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
\`\`\`

### Testing

Use the testnet for development. Switch to mainnet only when ready for production.`,
  },
  {
    id: 7,
    title: "Error Handling",
    shortContent: "Best practices for handling payment errors and edge cases.",
    fullContent: `# Error Handling

## Common Errors

### Payment Required (402)

The client hasn't paid for the request yet.

\`\`\`typescript
import { x402Fetch } from 'x402-mantle-sdk/client'

try {
  const response = await x402Fetch('/api/premium')
  const data = await response.json()
} catch (error) {
  if (error.status === 402) {
    // Payment modal will show automatically
    console.log('Payment required')
  }
}
\`\`\`

### Insufficient Balance

User doesn't have enough tokens.

\`\`\`typescript
// The payment modal will show an error
// User needs to add funds to their wallet
\`\`\`

### Network Errors

Handle network connection issues:

\`\`\`typescript
import { x402Fetch } from 'x402-mantle-sdk/client'

try {
  const response = await x402Fetch('/api/premium')
} catch (error) {
  if (error.message.includes('network')) {
    // Retry or show network error message
  }
}
\`\`\`

## Best Practices

- Always handle 402 errors gracefully
- Provide clear error messages
- Implement retry logic for network errors
- Log errors for debugging`,
  },
  {
    id: 8,
    title: "Testing",
    shortContent: "Test your paid APIs locally before deploying to production.",
    fullContent: `# Testing Your Paid APIs

## Local Development

### Using Mantle Sepolia Testnet

For local development, use the Mantle Sepolia testnet:

\`\`\`typescript
import { x402 } from 'x402-mantle-sdk/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true  // Use Mantle Sepolia testnet
}))
\`\`\`

### Get Test Tokens

1. Add Mantle Sepolia to MetaMask:
   - Chain ID: 5003
   - RPC: https://rpc.sepolia.mantle.xyz
   - Explorer: https://explorer.sepolia.mantle.xyz

2. Get test MNT from the [Mantle Faucet](https://faucet.sepolia.mantle.xyz/)

### Test Scenarios

1. **Successful Payment**: Verify payment flow works
2. **Insufficient Balance**: Test error handling
3. **Network Errors**: Simulate network issues
4. **Multiple Requests**: Test rate limiting

## Production Testing

Before going live:
- Test with small amounts on testnet first
- Verify payout wallet receives funds
- Check dashboard shows correct data
- Test error scenarios
- Switch to mainnet when ready`,
  },
  {
    id: 9,
    title: "Deployment",
    shortContent: "Deploy your x402-enabled APIs to production environments.",
    fullContent: `# Deployment Guide

## Pre-Deployment Checklist

- [ ] Test all endpoints locally
- [ ] Configure production database
- [ ] Set environment variables
- [ ] Update payout wallet addresses
- [ ] Test payment flow end-to-end

## Environment Setup

### Vercel Deployment

\`\`\`bash
# Set environment variables in Vercel dashboard
X402_APP_ID=your_app_id_here
X402_PLATFORM_URL=https://mantle-x402.vercel.app
\`\`\`

### Docker Deployment

\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
\`\`\`

## Post-Deployment

1. Monitor your dashboard
2. Check payment logs
3. Verify payouts are working
4. Set up alerts for errors`,
  },
  {
    id: 10,
    title: "Monitoring",
    shortContent: "Monitor payments, revenue, and API usage through the dashboard.",
    fullContent: `# Monitoring & Analytics

## Dashboard Features

### Overview Tab

- Total revenue
- Payment count
- Active projects
- Recent transactions

### Analytics Tab

- Revenue trends
- Payment volume
- User activity
- API usage stats

### Logs Tab

- Payment logs
- Error logs
- API requests
- Transaction history

## Key Metrics

Track these important metrics:

1. **Revenue**: Total earnings
2. **Payments**: Number of successful payments
3. **Errors**: Failed payment attempts
4. **Active Users**: Unique wallets using your API

## Best Practices

- Check dashboard daily
- Set up alerts for errors
- Monitor revenue trends
- Review logs weekly`,
  },
  {
    id: 11,
    title: "Security",
    shortContent: "Security best practices for handling payments and API keys.",
    fullContent: `# Security Best Practices

## API Key Security

### Never Expose Keys

\`\`\`typescript
// ❌ Bad
const API_KEY = 'sk_live_1234567890'
app.get('/api/data', (req, res) => {
  // API key exposed in client code
})

// ✅ Good
// Keep API keys server-side only
\`\`\`

## Wallet Security

### Private Keys

- Never commit private keys to git
- Use environment variables
- Store in secure vaults
- Rotate keys regularly

### Payout Wallets

- Use dedicated wallets for payouts
- Enable 2FA where possible
- Monitor for suspicious activity
- Keep backups secure

## Payment Security

### Validate Payments

Always verify payments on the server:

\`\`\`typescript
// x402 handles this automatically
// But verify in your business logic too
\`\`\`

### Rate Limiting

Implement rate limiting to prevent abuse:

\`\`\`typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

app.use('/api', limiter)
\`\`\`

## Best Practices

- Use HTTPS everywhere
- Validate all inputs
- Implement proper error handling
- Keep dependencies updated
- Monitor for vulnerabilities`,
  },
]

const ITEMS_PER_PAGE = 5

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 flex rounded-lg border border-foreground/10 bg-foreground/10 overflow-hidden">
      <pre className="flex-1 overflow-x-auto p-4">
        <code className="font-mono text-sm text-foreground/90">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center px-3 text-foreground/50 transition-colors hover:text-foreground"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

function renderMarkdown(content: string) {
  // First, extract code blocks and replace them with placeholders
  const codeBlocks: string[] = []
  const contentWithPlaceholders = content.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match)
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`
  })

  return contentWithPlaceholders.split('\n\n').map((paragraph, idx) => {
    // Check if it's a code block placeholder
    const codeBlockMatch = paragraph.match(/__CODE_BLOCK_(\d+)__/)
    if (codeBlockMatch) {
      const codeBlock = codeBlocks[parseInt(codeBlockMatch[1])]
      const lines = codeBlock.split('\n')
      const code = lines.slice(1, -1).join('\n')
      return <CodeBlock key={idx} code={code} />
    }
    // Check if it's a heading
    if (paragraph.startsWith('#')) {
      const level = paragraph.match(/^#+/)?.[0].length || 1
      const text = paragraph.replace(/^#+\s*/, '')
      const HeadingTag = `h${Math.min(level, 3)}` as 'h1' | 'h2' | 'h3'
      return (
        <HeadingTag
          key={idx}
          className={`font-sans font-light text-foreground ${
            level === 1 ? 'text-3xl mb-4' : level === 2 ? 'text-2xl mb-3 mt-6' : 'text-xl mb-2 mt-4'
          }`}
        >
          {text}
        </HeadingTag>
      )
    }
    // Check if it's a list item
    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
      const items = paragraph.split('\n').filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
      return (
        <ul key={idx} className="list-disc list-inside space-y-2 ml-4">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className="font-mono text-sm text-foreground/90">
              {item.replace(/^[-*]\s*/, '')}
            </li>
          ))}
        </ul>
      )
    }
    // Skip empty paragraphs
    if (!paragraph.trim()) return null
    // Regular paragraph
    return (
      <p key={idx} className="font-mono text-sm leading-relaxed text-foreground/90">
        {paragraph}
      </p>
    )
  })
}

export function DocsTab({ currentPage, setCurrentPage, selectedDoc, setSelectedDoc }: DocsTabProps) {
  // If a doc is selected, show detailed view
  if (selectedDoc !== null) {
    const doc = DOCS.find(d => d.id === selectedDoc)
    if (!doc) return null

    return (
      <div className="space-y-6">
        <BlurFade delay={0} direction="left">
          <button
            onClick={() => setSelectedDoc(null)}
            className="mb-4 flex items-center gap-2 text-foreground/70 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-sans text-sm">Back to Documentation</span>
          </button>
        </BlurFade>

        <BlurFade delay={0.1} direction="up">
          <div className="mb-6">
            <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl">
              {doc.title}
            </h2>
            <p className="font-mono text-sm text-foreground/60">/ Documentation</p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2} direction="up">
          <MagicCard
            gradientSize={300}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.15}
            className="rounded-2xl"
          >
            <div className="rounded-2xl border border-foreground/20 bg-foreground/5 p-8 backdrop-blur-xl">
              <div className="space-y-6">{renderMarkdown(doc.fullContent)}</div>
            </div>
          </MagicCard>
        </BlurFade>
      </div>
    )
  }

  // Show list view
  const totalPages = Math.ceil(DOCS.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentDocs = DOCS.slice(startIndex, endIndex)

  return (
    <>
      <BlurFade delay={0} direction="up">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl">
              Documentation
            </h2>
            <p className="font-mono text-sm text-foreground/60">/ Everything you need to know</p>
          </div>
        </div>
      </BlurFade>

      <div className="space-y-4 mb-6">
        {currentDocs.map((doc, index) => (
          <BlurFade key={doc.id} delay={index * 0.1} direction="left">
            <div onClick={() => setSelectedDoc(doc.id)} className="cursor-pointer">
              <MagicCard
                gradientSize={200}
                gradientFrom="oklch(0.35 0.15 240)"
                gradientTo="oklch(0.3 0.13 240)"
                gradientColor="oklch(0.35 0.15 240)"
                gradientOpacity={0.1}
                className="rounded-xl"
              >
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all hover:bg-foreground/10 hover:border-foreground/20">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px w-8 bg-foreground/30 transition-all duration-300 group-hover:w-12 group-hover:bg-foreground/50" />
                    <span className="font-mono text-xs text-foreground/60">0{doc.id}</span>
                  </div>
                  <h3 className="mb-2 font-sans text-xl font-light text-foreground md:text-2xl">{doc.title}</h3>
                  <p className="font-mono text-sm text-foreground/70">{doc.shortContent}</p>
                </div>
              </MagicCard>
            </div>
          </BlurFade>
        ))}
      </div>

      {/* Pagination */}
      <BlurFade delay={0.3} direction="up">
        <div className="flex items-center justify-between rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1))
                setSelectedDoc(null)
              }}
              disabled={currentPage === 1}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="font-mono text-sm text-foreground/70">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1))
                setSelectedDoc(null)
              }}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </BlurFade>
    </>
  )
}


