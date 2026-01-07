"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronRight, ChevronDown, Copy, Check, Zap, Menu, X, Sparkles, Box, Terminal, CreditCard, Wallet, Code, Server, Globe, Shield, Layers, ArrowRight } from "lucide-react"
import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

// Type definitions
interface NavItem {
  id: string
  title: string
  icon?: boolean
  hasChildren?: boolean
}

interface NavSection {
  title: string
  isHeader?: boolean
  items?: NavItem[]
}

// Combined Navigation
const NAVIGATION: NavSection[] = [
  {
    title: "Mantle DevKit",
    isHeader: true,
  },
  {
    title: "Overview",
    items: [
      { id: "devkit-intro", title: "Introduction", icon: true },
      { id: "devkit-networks", title: "Networks & Tokens" },
      { id: "devkit-protocols", title: "Protocol Support" },
    ],
  },
  {
    title: "x402 SDK",
    isHeader: true,
    items: [
      { id: "x402-intro", title: "Introduction" },
      { id: "x402-quickstart", title: "Quickstart" },
      { id: "x402-installation", title: "Installation" },
    ],
  },
  {
    title: "Server",
    items: [
      { id: "x402-middleware", title: "Middleware Setup" },
      { id: "x402-hono", title: "Hono Integration" },
      { id: "x402-express", title: "Express Integration" },
      { id: "x402-nextjs", title: "Next.js Integration" },
    ],
  },
  {
    title: "Client",
    items: [
      { id: "x402-fetch", title: "x402Fetch" },
      { id: "x402-react", title: "React Components" },
      { id: "x402-wallet", title: "Wallet Integration" },
    ],
  },
  {
    title: "Reference",
    items: [
      { id: "x402-tokens", title: "Supported Tokens" },
      { id: "x402-pricing", title: "Pricing Strategies" },
      { id: "x402-errors", title: "Error Handling" },
    ],
  },
  {
    title: "Agent Kit",
    isHeader: true,
    items: [
      { id: "agent-intro", title: "Introduction", icon: true },
      { id: "agent-quickstart", title: "Quickstart" },
      { id: "agent-installation", title: "Installation" },
    ],
  },
  {
    title: "DEX",
    items: [
      { id: "agent-agni", title: "Agni Finance", hasChildren: true },
      { id: "agent-merchant-moe", title: "Merchant Moe", hasChildren: true },
      { id: "agent-uniswap", title: "Uniswap V3", hasChildren: true },
    ],
  },
  {
    title: "Aggregators",
    items: [
      { id: "agent-1inch", title: "1inch", hasChildren: true },
      { id: "agent-openocean", title: "OpenOcean", hasChildren: true },
      { id: "agent-okx", title: "OKX DEX", hasChildren: true },
    ],
  },
  {
    title: "Protocols",
    items: [
      { id: "agent-lendle", title: "Lendle (Lending)" },
      { id: "agent-pyth", title: "Pyth Network (Oracles)" },
      { id: "agent-pikeperps", title: "PikePerps (Perpetuals)" },
      { id: "agent-squid", title: "Squid Router (Cross-Chain)" },
    ],
  },
  {
    title: "Launchpad",
    items: [
      { id: "agent-token", title: "Token Launchpad" },
      { id: "agent-nft", title: "NFT Launchpad" },
    ],
  },
]

// Documentation content
const DOCS_CONTENT: Record<string, { title: string; description: string; content: React.ReactNode }> = {
  // DevKit Overview
  "devkit-intro": {
    title: "Introduction to Mantle DevKit",
    description: "The complete developer suite for building on Mantle Network",
    content: <DevKitIntroContent />,
  },
  "devkit-networks": {
    title: "Networks & Tokens",
    description: "Supported networks, chain IDs, and token addresses",
    content: <DevKitNetworksContent />,
  },
  "devkit-protocols": {
    title: "Protocol Support",
    description: "DeFi protocols available on Mantle testnet and mainnet",
    content: <DevKitProtocolsContent />,
  },
  // x402 Documentation
  "x402-intro": {
    title: "Introduction to x402",
    description: "HTTP 402 Payment Required - Monetize your APIs with native blockchain payments",
    content: <X402IntroContent />,
  },
  "x402-quickstart": {
    title: "Quickstart",
    description: "Get started with x402 in under 5 minutes",
    content: <X402QuickstartContent />,
  },
  "x402-installation": {
    title: "Installation",
    description: "Install and configure x402-mantle-sdk",
    content: <X402InstallationContent />,
  },
  "x402-middleware": {
    title: "Middleware Setup",
    description: "Configure payment middleware for your server",
    content: <X402MiddlewareContent />,
  },
  "x402-hono": {
    title: "Hono Integration",
    description: "Use x402 with Hono framework",
    content: <X402HonoContent />,
  },
  "x402-express": {
    title: "Express Integration",
    description: "Use x402 with Express.js",
    content: <X402ExpressContent />,
  },
  "x402-nextjs": {
    title: "Next.js Integration",
    description: "Use x402 with Next.js API routes",
    content: <X402NextjsContent />,
  },
  "x402-fetch": {
    title: "x402Fetch",
    description: "Client-side fetch wrapper with automatic payment handling",
    content: <X402FetchContent />,
  },
  "x402-react": {
    title: "React Components",
    description: "Pre-built React components for payment UI",
    content: <X402ReactContent />,
  },
  "x402-wallet": {
    title: "Wallet Integration",
    description: "Connect wallets for payments",
    content: <X402WalletContent />,
  },
  "x402-tokens": {
    title: "Supported Tokens",
    description: "Tokens available for x402 payments",
    content: <X402TokensContent />,
  },
  "x402-pricing": {
    title: "Pricing Strategies",
    description: "Different pricing models for your APIs",
    content: <X402PricingContent />,
  },
  "x402-errors": {
    title: "Error Handling",
    description: "Handle payment errors gracefully",
    content: <X402ErrorsContent />,
  },
  // Agent Kit Documentation
  "agent-intro": {
    title: "Introduction to Agent Kit",
    description: "Build DeFi applications on Mantle with a unified SDK",
    content: <AgentIntroContent />,
  },
  "agent-quickstart": {
    title: "Quickstart",
    description: "Get started with Mantle Agent Kit",
    content: <AgentQuickstartContent />,
  },
  "agent-installation": {
    title: "Installation",
    description: "Install and configure mantle-agent-kit-sdk",
    content: <AgentInstallationContent />,
  },
  "agent-agni": {
    title: "Agni Finance",
    description: "DEX swaps using Agni Finance (Uniswap V3 fork)",
    content: <AgentAgniContent />,
  },
  "agent-merchant-moe": {
    title: "Merchant Moe",
    description: "DEX swaps using Merchant Moe (TraderJoe V2.1 fork)",
    content: <AgentMerchantMoeContent />,
  },
  "agent-uniswap": {
    title: "Uniswap V3",
    description: "DEX swaps using Uniswap V3 on Mantle",
    content: <AgentUniswapContent />,
  },
  "agent-1inch": {
    title: "1inch",
    description: "DEX aggregation with optimal routing",
    content: <Agent1inchContent />,
  },
  "agent-openocean": {
    title: "OpenOcean",
    description: "Cross-DEX aggregation protocol",
    content: <AgentOpenOceanContent />,
  },
  "agent-okx": {
    title: "OKX DEX",
    description: "OKX DEX aggregator integration",
    content: <AgentOKXContent />,
  },
  "agent-lendle": {
    title: "Lendle Protocol",
    description: "Lending and borrowing on Lendle (Aave V2 fork)",
    content: <AgentLendleContent />,
  },
  "agent-pyth": {
    title: "Pyth Network",
    description: "Real-time price oracles for 80+ assets",
    content: <AgentPythContent />,
  },
  "agent-pikeperps": {
    title: "PikePerps",
    description: "Leveraged perpetual trading (1-100x)",
    content: <AgentPikeperpsContent />,
  },
  "agent-squid": {
    title: "Squid Router",
    description: "Cross-chain swaps via Axelar network",
    content: <AgentSquidContent />,
  },
  "agent-token": {
    title: "Token Launchpad",
    description: "Deploy ERC20 and RWA tokens",
    content: <AgentTokenContent />,
  },
  "agent-nft": {
    title: "NFT Launchpad",
    description: "Deploy and manage ERC721 collections",
    content: <AgentNFTContent />,
  },
}

// Set default content for missing pages
const defaultContent = {
  title: "Coming Soon",
  description: "This documentation is being written",
  content: <div className="text-foreground/60">Documentation for this section is coming soon.</div>,
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="rounded-md bg-foreground/10 p-1.5 text-foreground/50 transition-colors hover:bg-foreground/20 hover:text-foreground"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-lg border border-foreground/10 bg-foreground/5">
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2">
        <span className="font-mono text-xs text-foreground/50">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm text-foreground/80">{code}</code>
      </pre>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
        {icon}
      </div>
      <h4 className="mb-2 font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-foreground/60">{description}</p>
    </div>
  )
}

// DevKit Content Components
function DevKitIntroContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">What is Mantle DevKit?</h2>
      <p className="mb-4 leading-relaxed text-foreground/70">
        Mantle DevKit is a comprehensive toolkit designed to accelerate development on Mantle Network.
        Whether you're building monetized APIs, integrating DeFi protocols, or creating AI agents
        that interact with blockchain, Mantle DevKit provides the infrastructure you need.
      </p>
      <p className="mb-6 leading-relaxed text-foreground/70">
        The toolkit includes production-ready SDKs, CLI tools, and documentation to help you
        ship faster on Mantle.
      </p>

      <h3 className="mb-4 text-xl font-semibold text-foreground">What's Included</h3>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <FeatureCard
          icon={<CreditCard className="h-5 w-5" />}
          title="x402 SDK"
          description="Monetize APIs with HTTP 402 payments. Accept MNT, USDC, USDT, and more."
        />
        <FeatureCard
          icon={<Layers className="h-5 w-5" />}
          title="Agent Kit"
          description="Unified DeFi protocol integrations for AI agents and trading bots."
        />
        <FeatureCard
          icon={<Terminal className="h-5 w-5" />}
          title="create-x402-app"
          description="CLI scaffolding tool to bootstrap x402 projects in seconds."
        />
        <FeatureCard
          icon={<Sparkles className="h-5 w-5" />}
          title="MCP Server"
          description="Claude AI integration with Mantle Network context."
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Quick Install</h3>
      <div className="space-y-3">
        <CodeBlock language="bash" code="# x402 SDK - API monetization
npm install x402-mantle-sdk" />
        <CodeBlock language="bash" code="# Agent Kit - DeFi integrations
npm install mantle-agent-kit-sdk" />
        <CodeBlock language="bash" code="# Scaffold a new x402 project
npx create-x402-app my-app" />
      </div>
    </article>
  )
}

function DevKitNetworksContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Networks & Tokens</h2>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Supported Networks</h3>
      <div className="mb-8 space-y-3">
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-foreground">Mantle Mainnet</span>
            <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Production</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-foreground/50">Chain ID:</span> <code className="text-foreground">5000</code></div>
            <div><span className="text-foreground/50">RPC:</span> <code className="text-foreground text-xs">https://rpc.mantle.xyz</code></div>
          </div>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-foreground">Mantle Sepolia</span>
            <span className="rounded bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/70">Testnet</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-foreground/50">Chain ID:</span> <code className="text-foreground">5003</code></div>
            <div><span className="text-foreground/50">RPC:</span> <code className="text-foreground text-xs">https://rpc.sepolia.mantle.xyz</code></div>
          </div>
        </div>
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Token Addresses (Mainnet)</h3>
      <div className="mb-6 space-y-2">
        {[
          { token: 'MNT', address: 'Native', decimals: 18 },
          { token: 'USDC', address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9', decimals: 6 },
          { token: 'USDT', address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE', decimals: 6 },
          { token: 'WMNT', address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8', decimals: 18 },
          { token: 'mETH', address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0', decimals: 18 },
          { token: 'WETH', address: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111', decimals: 18 },
        ].map((t) => (
          <div key={t.token} className="flex items-center justify-between rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-2">
            <span className="font-medium text-foreground">{t.token}</span>
            <code className="text-xs text-foreground/60">{t.address}</code>
          </div>
        ))}
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Block Explorers</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-2">
          <span className="text-foreground">Mainnet</span>
          <code className="text-xs text-primary">https://explorer.mantle.xyz</code>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-2">
          <span className="text-foreground">Testnet</span>
          <code className="text-xs text-primary">https://explorer.sepolia.mantle.xyz</code>
        </div>
      </div>
    </article>
  )
}

function DevKitProtocolsContent() {
  const bothNetworks = [
    { name: 'Native MNT', desc: 'Send/receive MNT tokens', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/27614.png' },
    { name: 'OKX DEX', desc: 'DEX aggregation', logo: '/okx.png' },
    { name: '1inch', desc: 'DEX aggregation', logo: '/1inch-1inch-logo.png' },
    { name: 'Squid Router', desc: 'Cross-chain swaps', logo: '/squid-router.png' },
    { name: 'OpenOcean', desc: 'DEX aggregation', logo: '/openocean.png' },
    { name: 'x402', desc: 'HTTP 402 payments', logo: '/X402.png' },
    { name: 'Pyth Network', desc: 'Price oracles (80+ assets)', logo: '/pyth.png' },
    { name: 'Token Launchpad', desc: 'ERC20 & RWA tokens', logo: '/X402.png' },
    { name: 'NFT Launchpad', desc: 'ERC721 collections', logo: '/X402.png' },
  ]

  const mainnetOnly = [
    { name: 'Lendle', desc: 'Lending/borrowing (Aave V2)', logo: '/pendle_logo.png' },
    { name: 'Agni Finance', desc: 'DEX (Uniswap V3 fork)', logo: '/agnifinance.png' },
    { name: 'Merchant Moe', desc: 'Liquidity Book DEX', logo: '/merchatmoe.jpg' },
    { name: 'mETH Protocol', desc: 'Liquid staking', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/29035.png' },
    { name: 'Uniswap V3', desc: 'DEX', logo: '/uniswap.png' },
    { name: 'PikePerps', desc: 'Perpetual trading', logo: '/pike-perps-logo.png' },
  ]

  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Protocol Support</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Mantle DevKit supports various DeFi protocols. Some are available on both testnet and mainnet,
        while others are mainnet-only.
      </p>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Available on Both Networks</h3>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {bothNetworks.map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
            <img src={p.logo} alt={p.name} className="h-8 w-8 rounded-full object-cover" />
            <div>
              <span className="font-medium text-foreground">{p.name}</span>
              <p className="text-xs text-foreground/50">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Mainnet Only</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {mainnetOnly.map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
            <img src={p.logo} alt={p.name} className="h-8 w-8 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">Mainnet</span>
              </div>
              <p className="text-xs text-foreground/50">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

// x402 Content Components
function X402IntroContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">What is x402?</h2>
      <p className="mb-4 leading-relaxed text-foreground/70">
        x402 is an implementation of the HTTP 402 Payment Required protocol for Mantle Network.
        It enables developers to monetize APIs by requiring cryptocurrency payments before granting
        access to protected resources.
      </p>
      <p className="mb-6 leading-relaxed text-foreground/70">
        With x402, you can add payment gates to any API endpoint with just a few lines of code.
        The SDK handles all the complexity of payment verification, wallet integration, and
        transaction confirmation.
      </p>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Key Features</h3>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <FeatureCard
          icon={<CreditCard className="h-5 w-5" />}
          title="Native Payments"
          description="Accept MNT, USDC, USDT, mETH, and WMNT tokens directly."
        />
        <FeatureCard
          icon={<Server className="h-5 w-5" />}
          title="Framework Support"
          description="Works with Hono, Express, Next.js, and more."
        />
        <FeatureCard
          icon={<Wallet className="h-5 w-5" />}
          title="Wallet Integration"
          description="Automatic wallet connection and payment modal."
        />
        <FeatureCard
          icon={<Shield className="h-5 w-5" />}
          title="Secure Verification"
          description="On-chain payment verification before access."
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">How It Works</h3>
      <div className="mb-6 space-y-4 text-foreground/70">
        <div className="flex gap-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
          <p>Client makes a request to a protected endpoint</p>
        </div>
        <div className="flex gap-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
          <p>Server returns HTTP 402 with payment requirements</p>
        </div>
        <div className="flex gap-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
          <p>Client displays payment modal and user confirms payment</p>
        </div>
        <div className="flex gap-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">4</span>
          <p>Payment is verified on-chain, access is granted</p>
        </div>
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Quick Example</h3>
      <CodeBlock
        language="typescript"
        code={`// Server - Protect an endpoint
import { x402 } from 'x402-mantle-sdk/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  network: 'mantle'
}))

// Client - Access protected endpoint
import { x402Fetch } from 'x402-mantle-sdk/client'

const response = await x402Fetch('/api/premium')
const data = await response.json()`}
      />
    </article>
  )
}

function X402QuickstartContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Quickstart Guide</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Get x402 running in your project in under 5 minutes.
      </p>

      <h3 className="mb-4 text-xl font-semibold text-foreground">1. Install the SDK</h3>
      <div className="mb-6">
        <CodeBlock language="bash" code="npm install x402-mantle-sdk" />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">2. Set Up Server Middleware</h3>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`import { Hono } from 'hono'
import { x402 } from 'x402-mantle-sdk/server'

const app = new Hono()

// Protect your premium endpoint
app.use('/api/premium/*', x402({
  price: '0.01',      // Price in tokens
  token: 'MNT',       // Token to accept
  testnet: true       // Use testnet for development
}))

app.get('/api/premium/data', (c) => {
  return c.json({ message: 'Premium content!' })
})

export default app`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">3. Set Up Client</h3>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`import { x402Fetch } from 'x402-mantle-sdk/client'

// x402Fetch automatically handles 402 responses
const response = await x402Fetch('https://api.example.com/api/premium/data')

if (response.ok) {
  const data = await response.json()
  console.log('Got premium data:', data)
}`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">4. Environment Variables</h3>
      <div className="mb-6">
        <CodeBlock
          language="bash"
          code={`# .env
X402_APP_ID=your-app-id-here`}
        />
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
        <p className="text-sm text-foreground/80">
          <strong>Tip:</strong> Use <code className="rounded bg-foreground/10 px-1">testnet: true</code> during
          development to test payments on Mantle Sepolia without real tokens.
        </p>
      </div>
    </article>
  )
}

function X402InstallationContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Installation</h2>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Package Installation</h3>
      <div className="mb-6 space-y-3">
        <CodeBlock language="bash" code="# npm
npm install x402-mantle-sdk" />
        <CodeBlock language="bash" code="# yarn
yarn add x402-mantle-sdk" />
        <CodeBlock language="bash" code="# pnpm
pnpm add x402-mantle-sdk" />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Peer Dependencies</h3>
      <p className="mb-4 text-foreground/70">The SDK requires the following peer dependencies:</p>
      <div className="mb-6">
        <CodeBlock language="bash" code="npm install viem @privy-io/react-auth" />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">TypeScript Support</h3>
      <p className="mb-4 text-foreground/70">
        The SDK is written in TypeScript and includes type definitions out of the box.
        No additional <code className="rounded bg-foreground/10 px-1">@types</code> packages needed.
      </p>
    </article>
  )
}

function X402MiddlewareContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Middleware Setup</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        The x402 middleware intercepts requests and verifies payments before allowing access.
      </p>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Configuration Options</h3>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`import { x402 } from 'x402-mantle-sdk/server'

const middleware = x402({
  // Required
  price: '0.01',           // Price per request
  token: 'MNT',            // 'MNT' | 'USDC' | 'USDT' | 'mETH' | 'WMNT'

  // Network (choose one)
  testnet: true,           // Use Mantle Sepolia
  network: 'mantle',       // Use Mantle Mainnet

  // Optional
  recipient: '0x...',      // Custom payment recipient
  description: 'API access', // Payment description
})`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Supported Tokens</h3>
      <div className="mb-6 grid gap-2">
        {['MNT', 'USDC', 'USDT', 'mETH', 'WMNT'].map((token) => (
          <div key={token} className="flex items-center justify-between rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-2">
            <span className="font-medium text-foreground">{token}</span>
            <span className="text-sm text-foreground/50">Supported</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function X402HonoContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Hono Integration</h2>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`import { Hono } from 'hono'
import { x402 } from 'x402-mantle-sdk/server'

const app = new Hono()

// Apply to specific routes
app.use('/api/premium/*', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))

// Protected route
app.get('/api/premium/content', (c) => {
  return c.json({
    data: 'Premium content',
    timestamp: Date.now()
  })
})

// Free route (no payment required)
app.get('/api/free', (c) => {
  return c.json({ data: 'Free content' })
})

export default app`}
        />
      </div>
    </article>
  )
}

function X402ExpressContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Express Integration</h2>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`import express from 'express'
import { x402Express } from 'x402-mantle-sdk/server'

const app = express()

// Apply middleware to premium routes
app.use('/api/premium', x402Express({
  price: '0.01',
  token: 'USDC',
  network: 'mantle'
}))

app.get('/api/premium/data', (req, res) => {
  res.json({ premium: true, data: '...' })
})

app.listen(3000)`}
        />
      </div>
    </article>
  )
}

function X402NextjsContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Next.js Integration</h2>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// app/api/premium/route.ts
import { NextResponse } from 'next/server'
import { x402Next } from 'x402-mantle-sdk/server'

export const GET = x402Next({
  price: '0.001',
  token: 'MNT',
  testnet: true
}, async (request) => {
  return NextResponse.json({
    data: 'Premium API response'
  })
})`}
        />
      </div>
    </article>
  )
}

function X402FetchContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">x402Fetch</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        A drop-in replacement for <code className="rounded bg-foreground/10 px-1">fetch</code> that
        automatically handles HTTP 402 responses with a payment modal.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`import { x402Fetch } from 'x402-mantle-sdk/client'

// Basic usage - same API as fetch
const response = await x402Fetch('/api/premium/data')
const data = await response.json()

// With options
const response = await x402Fetch('/api/premium/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'test' })
})`}
        />
      </div>
    </article>
  )
}

function X402ReactContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">React Components</h2>
      <div className="mb-6">
        <CodeBlock
          language="tsx"
          code={`import { X402Provider, PaymentButton } from 'x402-mantle-sdk/react'

function App() {
  return (
    <X402Provider>
      <PaymentButton
        endpoint="/api/premium"
        price="0.01"
        token="MNT"
        onSuccess={(data) => console.log('Paid!', data)}
        onError={(err) => console.error(err)}
      >
        Access Premium Content
      </PaymentButton>
    </X402Provider>
  )
}`}
        />
      </div>
    </article>
  )
}

function X402WalletContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Wallet Integration</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        x402 uses Privy for wallet connections, supporting multiple wallet providers.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="tsx"
          code={`import { PrivyProvider } from '@privy-io/react-auth'
import { X402Provider } from 'x402-mantle-sdk/react'

function App({ children }) {
  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}>
      <X402Provider>
        {children}
      </X402Provider>
    </PrivyProvider>
  )
}`}
        />
      </div>
    </article>
  )
}

function X402TokensContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Supported Tokens</h2>
      <div className="mb-6 space-y-3">
        {[
          { token: 'MNT', name: 'Mantle', decimals: 18, address: 'Native' },
          { token: 'USDC', name: 'USD Coin', decimals: 6, address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9' },
          { token: 'USDT', name: 'Tether USD', decimals: 6, address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE' },
          { token: 'WMNT', name: 'Wrapped MNT', decimals: 18, address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8' },
          { token: 'mETH', name: 'Mantle ETH', decimals: 18, address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0' },
        ].map((t) => (
          <div key={t.token} className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">{t.token}</span>
                <span className="ml-2 text-sm text-foreground/50">{t.name}</span>
              </div>
              <span className="text-xs text-foreground/50">{t.decimals} decimals</span>
            </div>
            <code className="mt-2 block text-xs text-foreground/60">{t.address}</code>
          </div>
        ))}
      </div>
    </article>
  )
}

function X402PricingContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Pricing Strategies</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Different ways to price your API access.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Fixed price per request
x402({ price: '0.001', token: 'MNT' })

// Different prices per endpoint
app.use('/api/basic/*', x402({ price: '0.001', token: 'MNT' }))
app.use('/api/premium/*', x402({ price: '0.01', token: 'MNT' }))

// Stablecoin pricing
x402({ price: '0.10', token: 'USDC' }) // $0.10 per request`}
        />
      </div>
    </article>
  )
}

function X402ErrorsContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Error Handling</h2>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`import { x402Fetch, X402Error } from 'x402-mantle-sdk/client'

try {
  const response = await x402Fetch('/api/premium')
  const data = await response.json()
} catch (error) {
  if (error instanceof X402Error) {
    switch (error.code) {
      case 'PAYMENT_CANCELLED':
        console.log('User cancelled payment')
        break
      case 'INSUFFICIENT_BALANCE':
        console.log('Not enough tokens')
        break
      case 'PAYMENT_FAILED':
        console.log('Transaction failed')
        break
    }
  }
}`}
        />
      </div>
    </article>
  )
}

// Agent Kit Content Components
function AgentIntroContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Mantle Agent Kit</h2>
      <p className="mb-4 leading-relaxed text-foreground/70">
        Mantle Agent Kit is a TypeScript SDK providing a unified interface to interact with DeFi
        protocols on Mantle Network. Designed for building AI agents, trading bots, and DeFi
        applications with a single, consistent API.
      </p>
      <p className="mb-6 leading-relaxed text-foreground/70">
        The SDK supports DEX aggregators, native DEXs, lending protocols, liquid staking,
        cross-chain operations, price oracles, perpetual trading, and token/NFT launchpads.
      </p>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Supported Protocols</h3>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <FeatureCard icon={<Layers className="h-5 w-5" />} title="DEX" description="Agni, Merchant Moe, Uniswap V3" />
        <FeatureCard icon={<Globe className="h-5 w-5" />} title="Aggregators" description="1inch, OpenOcean, OKX DEX" />
        <FeatureCard icon={<Wallet className="h-5 w-5" />} title="Lending" description="Lendle Protocol (Aave V2)" />
        <FeatureCard icon={<Zap className="h-5 w-5" />} title="Oracles" description="Pyth Network (80+ feeds)" />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Quick Example</h3>
      <CodeBlock
        language="typescript"
        code={`import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// DEX swap
await agent.agniSwap(tokenIn, tokenOut, amount)

// Get price
const price = await agent.pythGetTokenPrice(tokenAddress)

// Open leveraged position
await agent.pikeperpsOpenLong(token, margin, leverage)`}
      />
    </article>
  )
}

function AgentQuickstartContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Quickstart</h2>

      <h3 className="mb-4 text-xl font-semibold text-foreground">1. Install</h3>
      <div className="mb-6">
        <CodeBlock language="bash" code="npm install mantle-agent-kit-sdk" />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">2. Initialize</h3>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(
  process.env.PRIVATE_KEY!,
  "mainnet" // or "testnet"
)

await agent.initialize()`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">3. Use</h3>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Swap tokens
const txHash = await agent.agniSwap(
  "0x...", // tokenIn
  "0x...", // tokenOut
  "1000000000000000000" // 1 token in wei
)

// Get price
const price = await agent.pythGetPrice("ETH/USD")
console.log(price.formattedPrice)`}
        />
      </div>
    </article>
  )
}

function AgentInstallationContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Installation</h2>
      <div className="mb-6 space-y-3">
        <CodeBlock language="bash" code="npm install mantle-agent-kit-sdk" />
        <CodeBlock language="bash" code="yarn add mantle-agent-kit-sdk" />
        <CodeBlock language="bash" code="pnpm add mantle-agent-kit-sdk" />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Environment Setup</h3>
      <div className="mb-6">
        <CodeBlock
          language="bash"
          code={`# .env
PRIVATE_KEY=your_private_key_here
APP_ID=your_app_id_here

# Optional: API keys for aggregators
ONEINCH_API_KEY=your_1inch_key
OKX_API_KEY=your_okx_key`}
        />
      </div>
    </article>
  )
}

function AgentAgniContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Agni Finance</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Agni Finance is the leading DEX on Mantle, built on Uniswap V3 architecture with
        concentrated liquidity.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Basic swap
const txHash = await agent.agniSwap(
  "0xTokenInAddress",
  "0xTokenOutAddress",
  "1000000000000000000", // 1 token in wei
  0.5,  // slippage %
  3000  // fee tier (500, 3000, 10000)
)

// Get quote first
const quote = await agent.getAgniQuote(
  tokenIn,
  tokenOut,
  amount,
  3000
)
console.log("Expected output:", quote.amountOut)`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Fee Tiers</h3>
      <div className="mb-6 grid gap-2">
        {[
          { tier: '500', desc: '0.05% - Stable pairs' },
          { tier: '3000', desc: '0.3% - Standard pairs' },
          { tier: '10000', desc: '1% - Exotic pairs' },
        ].map((f) => (
          <div key={f.tier} className="flex justify-between rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-2">
            <code className="text-foreground">{f.tier}</code>
            <span className="text-foreground/60">{f.desc}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function AgentMerchantMoeContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Merchant Moe</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Merchant Moe is a Liquidity Book DEX built on TraderJoe V2.1 architecture, offering
        zero-slippage swaps within active bins and dynamic fees.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Swap on Merchant Moe
const txHash = await agent.merchantMoeSwap(
  "0xTokenInAddress",
  "0xTokenOutAddress",
  "1000000000000000000", // amount in wei
  0.5  // slippage %
)

// Get quote
const quote = await agent.getMerchantMoeQuote(
  tokenIn,
  tokenOut,
  amount
)
console.log("Expected output:", quote.amountOut)
console.log("Price impact:", quote.priceImpact)`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Features</h3>
      <div className="space-y-2">
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
          <span className="font-medium text-foreground">Zero Slippage</span>
          <p className="text-sm text-foreground/60">Trades within active bins have zero slippage</p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
          <span className="font-medium text-foreground">Dynamic Fees</span>
          <p className="text-sm text-foreground/60">Fees adjust based on market volatility</p>
        </div>
      </div>
    </article>
  )
}

function AgentUniswapContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Uniswap V3</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Direct integration with Uniswap V3 on Mantle Network. Access concentrated liquidity
        pools with customizable fee tiers.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Swap on Uniswap V3
const txHash = await agent.uniswapV3Swap(
  "0xTokenInAddress",
  "0xTokenOutAddress",
  "1000000000000000000", // amount in wei
  0.5,  // slippage %
  3000  // fee tier
)

// Multi-hop swap
const txHash = await agent.uniswapV3MultiHopSwap(
  ["0xTokenA", "0xTokenB", "0xTokenC"],
  [3000, 500], // fee tiers for each hop
  amount,
  0.5
)`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Contract Address</h3>
      <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
        <span className="text-sm text-foreground/60">SwapRouter:</span>
        <code className="ml-2 text-sm text-foreground">0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45</code>
      </div>
    </article>
  )
}

function Agent1inchContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">1inch Aggregator</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        1inch is a DEX aggregator that sources liquidity from multiple DEXs to find the
        best swap rates. Uses the Pathfinder algorithm for optimal routing.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Get quote from 1inch
const quote = await agent.get1inchQuote(
  "0xTokenIn",
  "0xTokenOut",
  "1000000000000000000" // amount in wei
)
console.log("Best rate:", quote.toAmount)
console.log("Protocols used:", quote.protocols)

// Execute swap
const txHash = await agent.swapOn1inch(
  "0xTokenIn",
  "0xTokenOut",
  "1000000000000000000",
  0.5  // slippage %
)`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Environment Setup</h3>
      <div className="mb-6">
        <CodeBlock
          language="bash"
          code={`# Optional: Add API key for higher rate limits
ONEINCH_API_KEY=your_api_key_here`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Features</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
          <span className="font-medium text-foreground">Multi-DEX Routing</span>
          <p className="text-sm text-foreground/60">Splits orders across DEXs</p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
          <span className="font-medium text-foreground">Gas Optimization</span>
          <p className="text-sm text-foreground/60">Optimized for lowest gas costs</p>
        </div>
      </div>
    </article>
  )
}

function AgentOpenOceanContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">OpenOcean</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        OpenOcean is a cross-chain DEX aggregator that finds the best prices across
        multiple liquidity sources on Mantle Network.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Get quote from OpenOcean
const quote = await agent.getOpenOceanQuote(
  "0xTokenIn",
  "0xTokenOut",
  "1000000000000000000"
)
console.log("Output amount:", quote.outAmount)
console.log("Price impact:", quote.priceImpact)

// Execute swap
const txHash = await agent.swapOnOpenOcean(
  "0xTokenIn",
  "0xTokenOut",
  "1000000000000000000",
  0.5  // slippage %
)

// Get supported tokens
const tokens = await agent.getOpenOceanTokens()`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Advantages</h3>
      <div className="space-y-2">
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
          <span className="font-medium text-foreground">No API Key Required</span>
          <p className="text-sm text-foreground/60">Works out of the box without configuration</p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
          <span className="font-medium text-foreground">Deep Liquidity</span>
          <p className="text-sm text-foreground/60">Aggregates from all major Mantle DEXs</p>
        </div>
      </div>
    </article>
  )
}

function AgentOKXContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">OKX DEX Aggregator</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        OKX DEX is a powerful aggregator backed by OKX exchange, providing competitive
        rates and deep liquidity on Mantle Network.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Get quote from OKX DEX
const quote = await agent.getOKXQuote(
  "0xTokenIn",
  "0xTokenOut",
  "1000000000000000000"
)
console.log("Output:", quote.toTokenAmount)

// Execute swap
const txHash = await agent.swapOnOKX(
  "0xTokenIn",
  "0xTokenOut",
  "1000000000000000000",
  0.5  // slippage %
)`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Environment Setup</h3>
      <div className="mb-6">
        <CodeBlock
          language="bash"
          code={`# Required: OKX API credentials
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id`}
        />
      </div>

      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
        <p className="text-sm text-foreground/80">
          <strong>Note:</strong> OKX DEX requires API credentials. Get them from the
          <a href="https://www.okx.com/web3/build/docs/devportal/introduction-to-developer-portal-interface" className="ml-1 text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            OKX Developer Portal
          </a>
        </p>
      </div>
    </article>
  )
}

function AgentLendleContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Lendle Protocol</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Lendle is a lending protocol built on Aave V2 architecture. Supply assets to earn yield
        or borrow against your collateral.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Supply assets
await agent.lendleSupply(tokenAddress, amount)

// Borrow against collateral
await agent.lendleBorrow(
  tokenAddress,
  amount,
  2  // interest rate mode: 1=stable, 2=variable
)

// Repay debt
await agent.lendleRepay(tokenAddress, amount)

// Withdraw
await agent.lendleWithdraw(tokenAddress, amount)`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Supported Assets</h3>
      <div className="grid gap-2 sm:grid-cols-3">
        {['USDC', 'USDT', 'WETH', 'WMNT', 'mETH'].map((token) => (
          <div key={token} className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-2 text-center">
            <span className="font-medium text-foreground">{token}</span>
          </div>
        ))}
      </div>

      <h3 className="mt-6 mb-4 text-xl font-semibold text-foreground">Contract Address</h3>
      <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
        <span className="text-sm text-foreground/60">LendingPool:</span>
        <code className="ml-2 text-sm text-foreground">0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3</code>
      </div>
    </article>
  )
}

function AgentPythContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Pyth Network</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Pyth provides real-time price feeds for 80+ assets including crypto, forex,
        commodities, and equities.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Get price by pair name
const ethPrice = await agent.pythGetPrice("ETH/USD")
console.log(ethPrice.formattedPrice) // "3450.00"

// Get price by token address
const price = await agent.pythGetTokenPrice(
  "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2"
)
console.log(price.tokenSymbol) // "USDC"
console.log(price.priceUsd)    // "1.00"

// Get multiple prices
const prices = await agent.pythGetMultiplePrices([
  "BTC/USD",
  "ETH/USD",
  "MNT/USD"
])

// Get EMA price (smoothed)
const ema = await agent.pythGetEmaPrice("BTC/USD")`}
        />
      </div>

      <h3 className="mb-4 text-xl font-semibold text-foreground">Supported Pairs</h3>
      <p className="text-foreground/70">
        80+ price feeds including BTC/USD, ETH/USD, MNT/USD, USDC/USD, EUR/USD, XAU/USD, and more.
      </p>
    </article>
  )
}

function AgentPikeperpsContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">PikePerps</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        PikePerps enables leveraged perpetual trading on meme tokens with 1-100x leverage.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Open long position
const position = await agent.pikeperpsOpenLong(
  tokenAddress,
  "1000000000000000000", // margin: 1 MNT
  10  // leverage: 10x
)
console.log(position.positionId)

// Open short position
const short = await agent.pikeperpsOpenShort(
  tokenAddress,
  margin,
  5  // 5x leverage
)

// Get all positions
const positions = await agent.pikeperpsGetPositions()
for (const pos of positions) {
  console.log(pos.unrealizedPnl)
  console.log(pos.liquidationPrice)
}

// Close position
await agent.pikeperpsClosePosition(positionId)`}
        />
      </div>
    </article>
  )
}

function AgentSquidContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Squid Router</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Cross-chain swaps powered by Axelar network. Bridge assets between Mantle and other chains.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Get route
const route = await agent.getSquidRoute(
  fromToken,
  toToken,
  181,  // Mantle LayerZero ID
  1,    // Ethereum LayerZero ID
  amount
)

// Execute cross-chain swap
const txHash = await agent.crossChainSwapViaSquid(
  fromToken,
  toToken,
  181,  // from Mantle
  1,    // to Ethereum
  amount,
  1     // slippage %
)`}
        />
      </div>
    </article>
  )
}

function AgentTokenContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Token Launchpad</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Deploy ERC20 tokens and RWA (Real World Asset) tokens on Mantle.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Deploy standard ERC20 token
const token = await agent.deployStandardToken(
  "My Token",     // name
  "MTK",          // symbol
  "1000000"       // initial supply
)
console.log(token.tokenAddress)

// Deploy RWA token
const rwa = await agent.deployRWAToken(
  "Manhattan Property",  // name
  "MPT",                 // symbol
  "10000",               // supply
  "Real Estate",         // asset category
  "PROP-001"             // asset ID
)`}
        />
      </div>
    </article>
  )
}

function AgentNFTContent() {
  return (
    <article>
      <h2 className="mb-6 text-2xl font-bold text-foreground">NFT Launchpad</h2>
      <p className="mb-6 leading-relaxed text-foreground/70">
        Deploy and manage ERC721 NFT collections on Mantle.
      </p>
      <div className="mb-6">
        <CodeBlock
          language="typescript"
          code={`// Deploy collection
const collection = await agent.deployNFTCollection({
  name: "My Collection",
  symbol: "MYC",
  baseURI: "https://api.example.com/metadata/",
  maxSupply: 10000
})
console.log(collection.collectionAddress)

// Mint NFT
const nft = await agent.mintNFT(collectionAddress)
console.log(nft.tokenId)

// Batch mint
await agent.batchMintNFT(
  collectionAddress,
  recipientAddress,
  10  // quantity
)`}
        />
      </div>
    </article>
  )
}

export default function DocsDemo() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDocId, setActiveDocId] = useState("devkit-intro")
  const [pageCopied, setPageCopied] = useState(false)
  const { ready, authenticated, login } = usePrivy()
  const router = useRouter()
  const mainContentRef = useRef<HTMLElement>(null)


  const currentDoc = DOCS_CONTENT[activeDocId] || defaultContent

  // Get current section for breadcrumb
  const currentSection = activeDocId.startsWith("devkit")
    ? "Mantle DevKit"
    : activeDocId.startsWith("x402")
      ? "x402 SDK"
      : "Agent Kit"

  // Get table of contents from navigation items near current doc
  const allItems = NAVIGATION.flatMap(section => section.items || [])
  const currentIndex = allItems.findIndex(item => item.id === activeDocId)
  const tableOfContents = allItems.slice(Math.max(0, currentIndex - 2), currentIndex + 6).map(item => ({
    id: item.id,
    title: item.title,
    active: item.id === activeDocId
  }))

  const handleNavClick = (id: string) => {
    setActiveDocId(id)
    // Scroll to top
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // Close mobile menu if open
    setMobileMenuOpen(false)
  }

  const handleCopyPage = () => {
    const contentElement = document.getElementById("doc-content")
    if (contentElement) {
      const textContent = contentElement.innerText || contentElement.textContent || ""
      const fullText = `${currentSection} - ${currentDoc.title}\n\n${currentDoc.description}\n\n${textContent}`
      navigator.clipboard.writeText(fullText)
      setPageCopied(true)
      setTimeout(() => setPageCopied(false), 2000)
    }
  }

  const handleGoToDashboard = () => {
    if (authenticated) {
      router.push("/dashboard")
    } else {
      login()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hide scrollbar CSS for webkit + smooth scroll */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Mobile Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-foreground/10 bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <img src="/X402.png" alt="Mantle DevKit" className="h-8 w-8 rounded-lg" />
          <span className="font-semibold text-foreground">Mantle DevKit</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-2 text-foreground/70 hover:bg-foreground/10"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex h-[calc(100vh-57px)] lg:h-screen">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-foreground/10 bg-background transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="hidden items-center border-b border-foreground/10 px-4 py-4 lg:flex">
              <Link href="/" className="flex items-center gap-2">
                <img src="/X402.png" alt="Mantle DevKit" className="h-7 w-7 rounded-lg" />
                <span className="font-semibold text-foreground">Mantle DevKit</span>
              </Link>
            </div>

            {/* Search */}
            <div className="border-b border-foreground/10 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full rounded-lg border border-foreground/10 bg-foreground/5 py-2 pl-9 pr-16 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary/50 focus:outline-none"
                  />
                  <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-foreground/20 bg-foreground/10 px-1.5 py-0.5 font-mono text-[10px] text-foreground/50">
                    Ctrl K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {NAVIGATION.map((section, idx) => (
                section.isHeader ? (
                  <div key={`header-${idx}`} className={`${idx > 0 ? "mt-8 border-t border-foreground/10 pt-6" : ""}`}>
                    <h2 className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-primary">{section.title}</h2>
                    {section.items && section.items.length > 0 && (
                      <ul className="space-y-0.5 mb-4">
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => handleNavClick(item.id)}
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                                activeDocId === item.id
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                              }`}
                            >
                              <span>{item.title}</span>
                              {item.hasChildren && (
                                <ChevronRight className="ml-auto h-4 w-4 text-foreground/40" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div key={`section-${idx}`} className="mb-4">
                    <h3 className="mb-2 px-2 text-sm font-medium text-foreground/80">{section.title}</h3>
                    <ul className="space-y-0.5">
                      {section.items?.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => handleNavClick(item.id)}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                              activeDocId === item.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                            }`}
                          >
                            <span>{item.title}</span>
                            {item.hasChildren && (
                              <ChevronRight className="ml-auto h-4 w-4 text-foreground/40" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </nav>

            {/* Dashboard Button */}
            <div className="border-t border-foreground/10 px-3 py-3">
              <button
                onClick={handleGoToDashboard}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
              >
                {authenticated ? "Dashboard" : "Connect"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main ref={mainContentRef} id="main-content" className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
            {/* Header Section - Fixed height to prevent layout shift */}
            <div className="mb-10">
              {/* Breadcrumb */}
              <div className="h-6 mb-2">
                <span className="text-sm font-medium text-primary">
                  {currentSection}
                </span>
              </div>

              {/* Page Title */}
              <div className="flex items-start justify-between gap-4 min-h-[2.5rem]">
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl leading-tight">
                  {currentDoc.title}
                </h1>
                <button
                  onClick={handleCopyPage}
                  className="hidden shrink-0 items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/10 lg:flex"
                >
                  {pageCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {pageCopied ? "Copied!" : "Copy page"}
                </button>
              </div>

              {/* Description - Fixed min height */}
              <p className="mt-2 text-foreground/60 min-h-[1.5rem]">{currentDoc.description}</p>
            </div>

            {/* Content */}
            <div id="doc-content">
              {currentDoc.content}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Table of Contents */}
        <aside className="hidden w-56 shrink-0 border-l border-foreground/10 xl:block">
          <div className="sticky top-0 px-4 py-10">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground/70">
              <span>=</span> On this page
            </h4>
            <nav className="space-y-1">
              {tableOfContents.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full py-1 text-left text-sm transition-colors ${
                    item.active
                      ? "font-medium text-primary"
                      : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
