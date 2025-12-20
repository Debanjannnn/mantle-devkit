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
    shortContent: "Learn how to set up x402 DevKit and create your first paid API endpoint.",
    fullContent: `# Getting Started with x402 DevKit

x402 DevKit is the complete toolkit for building paid APIs on Mantle Network. Get started in minutes with just three lines of code.

## Installation

\`\`\`bash
npm install @x402-devkit/server @x402-devkit/client
\`\`\`

## Quick Start

### Server Setup

\`\`\`typescript
import { x402 } from '@x402-devkit/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  network: 'mantle'
}))
\`\`\`

### Client Integration

\`\`\`typescript
import { x402Fetch } from '@x402-devkit/client'

const response = await x402Fetch('https://api.example.com/api/premium')
\`\`\`

That's it! Your API now accepts payments.`,
  },
  {
    id: 2,
    title: "API Reference",
    shortContent: "Complete reference for all x402 DevKit server and client methods.",
    fullContent: `# API Reference

## Server SDK

### x402(options)

Main middleware function to protect your API routes.

\`\`\`typescript
x402({
  price: string,        // Price in tokens (e.g., "0.001")
  token: string,        // Token symbol (e.g., "MNT", "USDC")
  network: string,      // Network name (e.g., "mantle")
  recipient?: string,   // Optional: custom recipient address
  testnet?: boolean     // Optional: use testnet
})
\`\`\`

## Client SDK

### x402Fetch(url, options?)

Fetch wrapper that handles payments automatically.

\`\`\`typescript
x402Fetch(url: string, options?: RequestInit): Promise<Response>
\`\`\`

### PaymentModal Component

React component for payment UI.

\`\`\`tsx
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
    title: "Payment Integration",
    shortContent: "Guide to integrating x402 payments into your existing API infrastructure.",
    fullContent: `# Payment Integration Guide

## Step-by-Step Integration

### 1. Install Dependencies

\`\`\`bash
npm install @x402-devkit/server
\`\`\`

### 2. Protect Your Endpoint

Wrap your existing API route with x402 middleware:

\`\`\`typescript
import { x402 } from '@x402-devkit/server'

// Before
app.get('/api/data', (req, res) => {
  res.json({ data: 'premium content' })
})

// After
app.use('/api/data', x402({
  price: '0.001',
  token: 'MNT',
  network: 'mantle'
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
import { x402Fetch } from '@x402-devkit/client'
const response = await x402Fetch('/api/data')
\`\`\`

The payment flow is handled automatically!`,
  },
  {
    id: 4,
    title: "Wallet Configuration",
    shortContent: "Configure payout wallets and manage payment settings.",
    fullContent: `# Wallet Configuration

## Setting Up Payout Wallets

### Create a Project

1. Go to your dashboard
2. Click "Create New Project"
3. Enter your project name
4. Set your payout wallet address
5. Copy your Project ID

### Using Your Project ID

\`\`\`typescript
import { x402 } from '@x402-devkit/server'

app.use('/api/premium', x402({
  projectId: 'your-project-id',
  price: '0.001',
  token: 'MNT',
  network: 'mantle'
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
    id: 5,
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
    id: 6,
    title: "Error Handling",
    shortContent: "Best practices for handling payment errors and edge cases.",
    fullContent: `# Error Handling

## Common Errors

### Payment Required (402)

The client hasn't paid for the request yet.

\`\`\`typescript
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
    id: 7,
    title: "Testing",
    shortContent: "Test your paid APIs locally before deploying to production.",
    fullContent: `# Testing Your Paid APIs

## Local Development

### Using the Sandbox

x402 DevKit includes a local sandbox for testing without real payments:

\`\`\`typescript
import { x402 } from '@x402-devkit/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  network: 'mantle',
  sandbox: true  // Enable sandbox mode
}))
\`\`\`

### Test Scenarios

1. **Successful Payment**: Verify payment flow works
2. **Insufficient Balance**: Test error handling
3. **Network Errors**: Simulate network issues
4. **Multiple Requests**: Test rate limiting

### Mock Payments

\`\`\`typescript
// In sandbox mode, payments are simulated
// No real tokens are transferred
\`\`\`

## Production Testing

Before going live:
- Test with small amounts
- Verify payout wallet receives funds
- Check dashboard shows correct data
- Test error scenarios`,
  },
  {
    id: 8,
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
DATABASE_URL=your_production_db_url
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
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
    id: 9,
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
    id: 10,
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


