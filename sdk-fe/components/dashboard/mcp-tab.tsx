"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"

export function McpTab() {
  const [copiedConfig, setCopiedConfig] = useState(false)
  const [copiedInstall, setCopiedInstall] = useState(false)
  const [copiedNpx, setCopiedNpx] = useState(false)

  const mcpConfig = `{
  "mcpServers": {
    "mantle": {
      "command": "npx",
      "args": ["mantle-mcp-server"]
    }
  }
}`

  const installCommand = "npm install -g mantle-mcp-server"
  const npxCommand = "npx mantle-mcp-server"

  const handleCopy = async (text: string, setter: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setter(true)
      setTimeout(() => setter(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const features = [
    { label: "Agent Kit SDK", desc: "Swaps, lending, cross-chain" },
    { label: "x402 Protocol", desc: "Server & client integration" },
    { label: "Contract Addresses", desc: "Lendle, Agni, Merchant Moe" },
    { label: "Code Examples", desc: "Ready-to-use snippets" },
  ]

  return (
    <>
      {/* Header */}
      <BlurFade delay={0} direction="up">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl">
              MCP Server
            </h2>
            <p className="font-mono text-sm text-foreground/60">/ Add Mantle context to Claude</p>
          </div>
          <a
            href="https://www.npmjs.com/package/mantle-mcp-server"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
          >
            <ExternalLink className="h-4 w-4" />
            npm
          </a>
        </div>
      </BlurFade>

      <div className="space-y-4">
        {/* Installation */}
        <BlurFade delay={0.1} direction="left">
          <MagicCard
            gradientSize={200}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.1}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-8 bg-foreground/30" />
                <span className="font-mono text-xs text-foreground/60">01</span>
              </div>
              <h3 className="mb-4 font-sans text-xl font-light text-foreground md:text-2xl">Installation</h3>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-mono text-xs text-foreground/50">Install globally</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-foreground/10 bg-background px-4 py-3 font-mono text-sm text-foreground">
                      {installCommand}
                    </code>
                    <button
                      onClick={() => handleCopy(installCommand, setCopiedInstall)}
                      className="rounded-lg border border-foreground/20 bg-foreground/10 p-3 text-foreground/60 transition-colors hover:bg-foreground/15 hover:text-foreground"
                    >
                      {copiedInstall ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 font-mono text-xs text-foreground/50">Or run with npx</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-foreground/10 bg-background px-4 py-3 font-mono text-sm text-foreground">
                      {npxCommand}
                    </code>
                    <button
                      onClick={() => handleCopy(npxCommand, setCopiedNpx)}
                      className="rounded-lg border border-foreground/20 bg-foreground/10 p-3 text-foreground/60 transition-colors hover:bg-foreground/15 hover:text-foreground"
                    >
                      {copiedNpx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        {/* Claude Config */}
        <BlurFade delay={0.2} direction="left">
          <MagicCard
            gradientSize={200}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.1}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-8 bg-foreground/30" />
                <span className="font-mono text-xs text-foreground/60">02</span>
              </div>
              <h3 className="mb-2 font-sans text-xl font-light text-foreground md:text-2xl">Claude Desktop Config</h3>
              <p className="mb-4 font-mono text-sm text-foreground/70">
                Add to ~/.config/claude/claude_desktop_config.json
              </p>

              <div className="relative">
                <pre className="rounded-lg border border-foreground/10 bg-background p-4 font-mono text-sm text-foreground overflow-x-auto">
                  {mcpConfig}
                </pre>
                <button
                  onClick={() => handleCopy(mcpConfig, setCopiedConfig)}
                  className="absolute right-2 top-2 flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-1.5 font-mono text-xs text-foreground/60 transition-colors hover:bg-foreground/15 hover:text-foreground"
                >
                  {copiedConfig ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedConfig ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        {/* What Claude Gets */}
        <BlurFade delay={0.3} direction="left">
          <MagicCard
            gradientSize={200}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.1}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-8 bg-foreground/30" />
                <span className="font-mono text-xs text-foreground/60">03</span>
              </div>
              <h3 className="mb-4 font-sans text-xl font-light text-foreground md:text-2xl">What Claude gets</h3>

              <div className="grid gap-3 md:grid-cols-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="rounded-lg border border-foreground/10 bg-background/50 p-4">
                    <p className="font-sans text-sm font-medium text-foreground">{feature.label}</p>
                    <p className="mt-1 font-mono text-xs text-foreground/50">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </MagicCard>
        </BlurFade>
      </div>
    </>
  )
}
