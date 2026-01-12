"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, ChevronDown } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"

const PROTOCOLS = [
  {
    name: "Agni Finance",
    category: "DEX",
    logo: "/agnifinance.png",
    description: "Leading DEX with concentrated liquidity (Uniswap V3 fork)",
    contracts: {
      mainnet: "0x319B69888b0d11cEC22caA5034e25FfFBDc88421",
    },
    explorer: "https://mantlescan.xyz/address/0x319B69888b0d11cEC22caA5034e25FfFBDc88421",
    methods: ["agniSwap"],
    networks: ["mainnet"],
  },
  {
    name: "Merchant Moe",
    category: "DEX",
    logo: "/merchatmoe.jpg",
    description: "Liquidity Book DEX (TraderJoe V2.1 fork)",
    contracts: {
      mainnet: "0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a",
    },
    explorer: "https://mantlescan.xyz/address/0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a",
    methods: ["merchantMoeSwap"],
    networks: ["mainnet"],
  },
  {
    name: "Lendle",
    category: "Lending",
    logo: "/pendle_logo.png",
    description: "Lending protocol built on Aave V2 architecture",
    contracts: {
      mainnet: "0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3",
    },
    explorer: "https://mantlescan.xyz/address/0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3",
    methods: ["lendleSupply", "lendleWithdraw", "lendleBorrow", "lendleRepay"],
    networks: ["mainnet"],
  },
  {
    name: "OKX DEX",
    category: "Aggregator",
    logo: "/okx.png",
    description: "Multi-source liquidity aggregation",
    contracts: {
      mainnet: "API-based",
    },
    explorer: "https://www.okx.com/web3/dex",
    methods: ["getSwapQuote", "executeSwap"],
    networks: ["mainnet", "testnet"],
  },
  {
    name: "OpenOcean",
    category: "Aggregator",
    logo: "/openocean.png",
    description: "Cross-DEX aggregation for best prices",
    contracts: {
      mainnet: "API-based",
    },
    explorer: "https://openocean.finance",
    methods: ["getOpenOceanQuote", "swapOnOpenOcean"],
    networks: ["mainnet", "testnet"],
  },
  {
    name: "Squid Router",
    category: "Cross-Chain",
    logo: "/squid-router.png",
    description: "Cross-chain swaps via Axelar network",
    contracts: {
      mainnet: "API-based",
    },
    explorer: "https://app.squidrouter.com",
    methods: ["getSquidRoute", "crossChainSwapViaSquid"],
    networks: ["mainnet", "testnet"],
  },
  {
    name: "Uniswap V3",
    category: "DEX",
    logo: "/uniswap.png",
    description: "Canonical Uniswap V3 deployment",
    contracts: {
      mainnet: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    },
    explorer: "https://mantlescan.xyz/address/0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    methods: ["getUniswapQuote", "swapOnUniswap"],
    networks: ["mainnet"],
  },
  {
    name: "Pyth Network",
    category: "Oracle",
    logo: "/pyth.png",
    description: "Real-time price feeds for 80+ assets (crypto, forex, commodities)",
    contracts: {
      mainnet: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
      testnet: "0x98046Bd286715D3B0BC227Dd7a956b83D8978603",
    },
    explorer: "https://mantlescan.xyz/address/0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    methods: ["pythGetPrice", "pythGetTokenPrice", "pythGetMultiplePrices", "pythGetEmaPrice"],
    networks: ["mainnet", "testnet"],
  },
  {
    name: "PikePerps",
    category: "Perpetuals",
    logo: "/pike-perps-logo.png",
    description: "Leveraged perpetual trading on meme tokens (1-100x)",
    contracts: {
      mainnet: "0x6b9bb36519538e0C073894E964E90172E1c0B41F",
    },
    explorer: "https://mantlescan.xyz/address/0x6b9bb36519538e0C073894E964E90172E1c0B41F",
    methods: ["pikeperpsOpenLong", "pikeperpsOpenShort", "pikeperpsClosePosition", "pikeperpsGetPositions"],
    networks: ["mainnet"],
  },
]

const CODE_TEMPLATES = [
  {
    id: "swap-agni",
    name: "Swap on Agni",
    category: "DEX",
    networks: ["mainnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

const txHash = await agent.agniSwap(
  "0xTokenInAddress",  // Token to sell
  "0xTokenOutAddress", // Token to buy
  "1000000000000000000", // Amount in wei (1 token)
  0.5,  // Slippage %
  3000  // Fee tier (500, 3000, 10000)
)

console.log("Swap tx:", txHash)`,
  },
  {
    id: "lendle-supply",
    name: "Supply to Lendle",
    category: "Lending",
    networks: ["mainnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// Supply tokens to earn yield
const txHash = await agent.lendleSupply(
  "0xTokenAddress",      // Token to supply
  "1000000000000000000"  // Amount in wei
)

console.log("Supply tx:", txHash)`,
  },
  {
    id: "lendle-borrow",
    name: "Borrow from Lendle",
    category: "Lending",
    networks: ["mainnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// Borrow against collateral
const txHash = await agent.lendleBorrow(
  "0xTokenAddress",     // Token to borrow
  "500000000000000000", // Amount in wei
  2  // Interest rate mode: 1=stable, 2=variable
)

console.log("Borrow tx:", txHash)`,
  },
  {
    id: "cross-chain",
    name: "Cross-Chain Swap",
    category: "Cross-Chain",
    networks: ["mainnet", "testnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// Swap from Mantle to Ethereum
const txHash = await agent.crossChainSwapViaSquid(
  "0xFromToken",
  "0xToToken",
  181,  // From: Mantle (LayerZero ID)
  1,    // To: Ethereum (LayerZero ID)
  "1000000000000000000",
  1     // Slippage %
)

console.log("Bridge tx:", txHash)`,
  },
  {
    id: "pyth-price",
    name: "Get Token Price (Pyth)",
    category: "Oracle",
    networks: ["mainnet", "testnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// Get price by pair name
const ethPrice = await agent.pythGetPrice("ETH/USD")
console.log("ETH Price:", ethPrice.formattedPrice)

// Get price by token address
const price = await agent.pythGetTokenPrice(
  "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2" // USDC
)
console.log("Token:", price.tokenSymbol)
console.log("Price:", price.priceUsd)
console.log("Updated:", price.lastUpdated)

// Get multiple prices at once
const prices = await agent.pythGetMultiplePrices([
  "BTC/USD",
  "ETH/USD",
  "0xcDA86A272531e8640cD7F1a92c01839911B90bb0" // mETH
])`,
  },
  {
    id: "pikeperps-long",
    name: "Open Long Position",
    category: "Perpetuals",
    networks: ["mainnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// Open a long position with 10x leverage
const position = await agent.pikeperpsOpenLong(
  "0xTokenAddress",        // Meme token to trade
  "1000000000000000000",   // Margin in wei (1 MNT)
  10                       // Leverage (1-100x)
)

console.log("Position ID:", position.positionId)
console.log("Tx Hash:", position.txHash)`,
  },
  {
    id: "pikeperps-short",
    name: "Open Short Position",
    category: "Perpetuals",
    networks: ["mainnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// Open a short position with 5x leverage
const position = await agent.pikeperpsOpenShort(
  "0xTokenAddress",        // Meme token to trade
  "500000000000000000",    // Margin in wei (0.5 MNT)
  5                        // Leverage (1-100x)
)

console.log("Position ID:", position.positionId)`,
  },
  {
    id: "pikeperps-manage",
    name: "Manage Positions",
    category: "Perpetuals",
    networks: ["mainnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// Get all your positions
const positions = await agent.pikeperpsGetPositions()
for (const pos of positions) {
  console.log("Position:", pos.positionId)
  console.log("PnL:", pos.unrealizedPnl)
  console.log("Liquidation Price:", pos.liquidationPrice)
}

// Close a position
const txHash = await agent.pikeperpsClosePosition(positionId)
console.log("Closed:", txHash)`,
  },
  {
    id: "full-example",
    name: "Full Setup Example",
    category: "Setup",
    networks: ["mainnet", "testnet"],
    code: `import { MNTAgentKit } from "mantle-agent-kit-sdk"

// Initialize the agent
const agent = new MNTAgentKit(
  process.env.PRIVATE_KEY!,
  "mainnet" // or "testnet"
)

// Required: Initialize with platform validation
await agent.initialize()

// Now you can use any method:

// 1. DEX Swaps
await agent.agniSwap(tokenIn, tokenOut, amount)
await agent.merchantMoeSwap(tokenIn, tokenOut, amount)

// 2. Aggregators (best rates)
await agent.swapOnOpenOcean(tokenIn, tokenOut, amount, slippage)

// 3. Lending
await agent.lendleSupply(token, amount)
await agent.lendleBorrow(token, amount, rateMode)

// 4. Cross-chain
await agent.crossChainSwapViaSquid(
  fromToken, toToken, fromChain, toChain, amount, slippage
)

// 5. Price Oracles (Pyth)
const price = await agent.pythGetTokenPrice(tokenAddress)

// 6. Perpetual Trading (PikePerps)
await agent.pikeperpsOpenLong(token, margin, leverage)`,
  },
]

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
      className="flex items-center gap-1.5 rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-1.5 font-mono text-xs text-foreground/70 transition-colors hover:bg-foreground/15 hover:text-foreground"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

function ProtocolCard({ protocol }: { protocol: typeof PROTOCOLS[0] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <MagicCard
      gradientSize={150}
      gradientFrom="oklch(0.35 0.15 240)"
      gradientTo="oklch(0.3 0.13 240)"
      gradientColor="oklch(0.35 0.15 240)"
      gradientOpacity={0.1}
      className="rounded-xl"
    >
      <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/10 overflow-hidden">
              <img src={protocol.logo} alt={protocol.name} className="h-full w-full object-contain" />
            </div>
            <div>
              <h3 className="font-sans text-base font-medium text-foreground">{protocol.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="inline-block rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/70">
                  {protocol.category}
                </span>
                {protocol.networks.includes("mainnet") && (
                  <span className="inline-block rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/70">
                    Mainnet
                  </span>
                )}
                {protocol.networks.includes("testnet") && (
                  <span className="inline-block rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/70">
                    Testnet
                  </span>
                )}
              </div>
            </div>
          </div>
          <a
            href={protocol.explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/50 transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <p className="mt-3 font-mono text-xs text-foreground/60">{protocol.description}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex w-full items-center justify-between rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/70 transition-colors hover:bg-foreground/10"
        >
          <span>Contract & Methods</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            expanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-2">
              {protocol.contracts.mainnet && (
                <div className="rounded-lg bg-foreground/5 p-3">
                  <p className="mb-1 font-mono text-xs text-foreground/50">Mainnet</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono text-xs text-foreground/80 truncate">{protocol.contracts.mainnet}</code>
                    {protocol.contracts.mainnet !== "API-based" && (
                      <CopyButton text={protocol.contracts.mainnet} />
                    )}
                  </div>
                </div>
              )}
              {protocol.contracts.testnet && (
                <div className="rounded-lg bg-foreground/5 p-3">
                  <p className="mb-1 font-mono text-xs text-foreground/50">Testnet</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono text-xs text-foreground/80 truncate">{protocol.contracts.testnet}</code>
                    <CopyButton text={protocol.contracts.testnet} />
                  </div>
                </div>
              )}
              <div className="rounded-lg bg-foreground/5 p-3">
                <p className="mb-2 font-mono text-xs text-foreground/50">Methods</p>
                <div className="flex flex-wrap gap-1">
                  {protocol.methods.map((method) => (
                    <code
                      key={method}
                      className="rounded bg-foreground/10 px-2 py-1 font-mono text-xs text-foreground/70"
                    >
                      {method}()
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MagicCard>
  )
}

function CodeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(CODE_TEMPLATES[0])
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = ["all", ...new Set(CODE_TEMPLATES.map((t) => t.category))]
  const filteredTemplates =
    activeCategory === "all"
      ? CODE_TEMPLATES
      : CODE_TEMPLATES.filter((t) => t.category === activeCategory)

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
              activeCategory === cat
                ? "bg-foreground/15 text-foreground"
                : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Template List */}
        <div className="space-y-2 lg:col-span-1">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`w-full rounded-lg border p-3 text-left transition-all ${
                selectedTemplate.id === template.id
                  ? "border-foreground/30 bg-foreground/10"
                  : "border-foreground/10 bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              <p className="font-sans text-sm text-foreground">{template.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="inline-block rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/70">
                  {template.category}
                </span>
                {template.networks.includes("mainnet") && (
                  <span className="inline-block rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/70">
                    Mainnet
                  </span>
                )}
                {template.networks.includes("testnet") && (
                  <span className="inline-block rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/70">
                    Testnet
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Code Preview */}
        <div className="lg:col-span-2">
          <MagicCard
            gradientSize={200}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.15}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/20 bg-foreground/5 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-foreground/30" />
                    <div className="h-3 w-3 rounded-full bg-foreground/30" />
                    <div className="h-3 w-3 rounded-full bg-foreground/30" />
                  </div>
                  <span className="ml-2 font-mono text-xs text-foreground/60">{selectedTemplate.name}.ts</span>
                </div>
                <CopyButton text={selectedTemplate.code} />
              </div>
              <pre className="overflow-x-auto p-4">
                <code className="font-mono text-sm leading-relaxed text-foreground/80">
                  {selectedTemplate.code}
                </code>
              </pre>
            </div>
          </MagicCard>
        </div>
      </div>
    </div>
  )
}

export function AgentKitTab() {
  const [activeSection, setActiveSection] = useState<"protocols" | "generator">("protocols")

  return (
    <div className="space-y-6">
      <BlurFade delay={0} direction="up">
        <div className="mb-6">
          <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl">
            Agent Kit
          </h2>
          <p className="font-mono text-sm text-foreground/60">/ DeFi protocol integrations</p>
        </div>
      </BlurFade>

      {/* Section Tabs */}
      <BlurFade delay={0.1} direction="up">
        <div className="flex gap-2 border-b border-foreground/10 pb-4">
          <button
            onClick={() => setActiveSection("protocols")}
            className={`rounded-lg px-4 py-2 font-sans text-sm transition-colors ${
              activeSection === "protocols"
                ? "bg-foreground/10 text-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Protocol Explorer
          </button>
          <button
            onClick={() => setActiveSection("generator")}
            className={`rounded-lg px-4 py-2 font-sans text-sm transition-colors ${
              activeSection === "generator"
                ? "bg-foreground/10 text-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Code Generator
          </button>
        </div>
      </BlurFade>

      {activeSection === "protocols" && (
        <BlurFade delay={0.2} direction="up">
          <div className="flex flex-wrap gap-4">
            {PROTOCOLS.map((protocol) => (
              <div key={protocol.name} className="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]">
                <ProtocolCard protocol={protocol} />
              </div>
            ))}
          </div>
        </BlurFade>
      )}

      {activeSection === "generator" && (
        <BlurFade delay={0.2} direction="up">
          <CodeGenerator />
        </BlurFade>
      )}
    </div>
  )
}
