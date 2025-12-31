"use client"

import { useState, useEffect, Fragment } from "react"
import { Copy, Check, Play, LogOut, Wallet, Network, Sidebar, Eye, EyeOff, GitBranch, ArrowRight, Zap, RefreshCw, ExternalLink, TrendingUp, Activity, DollarSign } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"
import { PaymentModal, PaymentRequest } from "@/components/payment-modal"
import { usePrivy } from "@privy-io/react-auth"
import { useDashboard } from "@/contexts/dashboard-context"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const TREASURY_ADDRESS = "0xB27705342ACE73736AE490540Ea031cc06C3eF49"

interface Transaction {
  transactionHash: string
  from: string
  amount: string
  blockNumber: number
  timestamp: number
  type?: string
}

interface ChartData {
  date: string
  amount: number
  count: number
}

export function AnalyticsTab() {
  const { isAdmin } = useDashboard()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [totalVolume, setTotalVolume] = useState("0")
  const [txCount, setTxCount] = useState(0)

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch from our API route to avoid CORS issues
      const response = await fetch('/api/treasury/transactions')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch transactions')
      }

      const data = await response.json()

      setTransactions(data.transactions || [])
      setTxCount(data.txCount || 0)
      setTotalVolume(data.totalVolume || "0")
      setChartData(data.chartData || [])

    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch transactions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchTransactions()
    }
  }, [isAdmin])

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(hash)
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full border border-red-500/30 bg-red-500/10 p-6">
          <Activity className="h-12 w-12 text-red-500/60" />
        </div>
        <h3 className="mb-2 font-sans text-xl font-light text-foreground">Access Denied</h3>
        <p className="mb-6 max-w-md font-mono text-sm text-foreground/60">
          Analytics is only available for admin users.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        <p className="font-sans text-sm text-foreground/60">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 font-sans text-2xl font-light text-foreground">Treasury Analytics</h2>
          <p className="font-mono text-sm text-foreground/60">
            Platform fee transactions from Treasury contract
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-foreground/60" />
            <p className="font-mono text-xs text-foreground/60">Total Volume</p>
          </div>
          <p className="font-sans text-2xl font-light text-foreground">{totalVolume} MNT</p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-foreground/60" />
            <p className="font-mono text-xs text-foreground/60">Total Transactions</p>
          </div>
          <p className="font-sans text-2xl font-light text-foreground">{txCount}</p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-foreground/60" />
            <p className="font-mono text-xs text-foreground/60">Treasury Address</p>
          </div>
          <p className="font-mono text-sm text-foreground">{formatAddress(TREASURY_ADDRESS)}</p>
        </div>
      </div>

      {/* Transaction Chart */}
      {chartData.length > 0 && (
        <BlurFade delay={0.1} direction="up">
          <MagicCard
            gradientSize={300}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.15}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-sans text-lg font-light text-foreground">Fee Volume Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                      <stop offset="50%" stopColor="#1d4ed8" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#1e3a5f" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(59,130,246,0.15)"
                    vertical={false}
                    horizontal={true}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#60a5fa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(59,130,246,0.3)' }}
                  />
                  <YAxis
                    stroke="#60a5fa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toFixed(6)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30,58,138,0.95)',
                      border: '1px solid #3b82f6',
                      borderRadius: '8px',
                      color: '#93c5fd',
                    }}
                    formatter={(value: number) => [`${value.toFixed(6)} MNT`, 'Fee Volume']}
                  />
                  <Area
                    type="natural"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBlue)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#3b82f6', stroke: '#93c5fd', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </div>
          </MagicCard>
        </BlurFade>
      )}

      {/* Transactions Table */}
      <BlurFade delay={0.2} direction="up">
        <MagicCard
          gradientSize={300}
          gradientFrom="oklch(0.35 0.15 240)"
          gradientTo="oklch(0.3 0.13 240)"
          gradientColor="oklch(0.35 0.15 240)"
          gradientOpacity={0.15}
          className="rounded-xl"
        >
          <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-sans text-lg font-light text-foreground">Recent Transactions</h3>

            {transactions.length === 0 ? (
              <div className="py-8 text-center">
                <Activity className="mx-auto mb-4 h-12 w-12 text-foreground/30" />
                <p className="font-mono text-sm text-foreground/50">No transactions found</p>
                <p className="mt-2 font-mono text-xs text-foreground/40">
                  Transactions will appear here when fees are received by the Treasury
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-foreground/10">
                      <th className="pb-3 text-left font-mono text-xs font-medium text-foreground/60">TX Hash</th>
                      <th className="pb-3 text-left font-mono text-xs font-medium text-foreground/60">From</th>
                      <th className="pb-3 text-right font-mono text-xs font-medium text-foreground/60">Fee Amount</th>
                      <th className="pb-3 text-right font-mono text-xs font-medium text-foreground/60">Date</th>
                      <th className="pb-3 text-right font-mono text-xs font-medium text-foreground/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.transactionHash} className="border-b border-foreground/5 last:border-0">
                        <td className="py-3">
                          <code className="font-mono text-xs text-foreground">
                            {tx.transactionHash.slice(0, 10)}...{tx.transactionHash.slice(-6)}
                          </code>
                        </td>
                        <td className="py-3">
                          <code className="font-mono text-xs text-foreground/70">
                            {formatAddress(tx.from)}
                          </code>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-mono text-xs text-foreground">{tx.amount} MNT</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-mono text-xs text-foreground/60">
                            {formatDate(tx.timestamp)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCopyHash(tx.transactionHash)}
                              className="text-foreground/40 transition-colors hover:text-foreground/60"
                              title="Copy transaction hash"
                            >
                              {copiedHash === tx.transactionHash ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <a
                              href={`https://sepolia.mantlescan.xyz/tx/${tx.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground/40 transition-colors hover:text-foreground/60"
                              title="View on explorer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </MagicCard>
      </BlurFade>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="font-mono text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  )
}

export function EndpointsTab() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  // Define nodes with positions for n8n-style workflow layout
  // Optimized for 14-inch Mac screens (compact layout)
  const nodes = [
    // Entry points (left side)
    {
      id: "entry-get",
      method: "GET",
      path: "/api/projects",
      description: "List Projects",
      color: "blue",
      x: 40,
      y: 120,
      connections: [{ targetId: "hub", label: "GET" }],
      isEntry: true,
    },
    {
      id: "entry-post",
      method: "POST",
      path: "/api/projects",
      description: "Create Project",
      color: "green",
      x: 40,
      y: 240,
      connections: [{ targetId: "hub", label: "POST" }],
      isEntry: true,
    },
    // Central Hub
    {
      id: "hub",
      method: "HUB",
      path: "Projects API",
      description: "Route by method",
      color: "blue",
      x: 320,
      y: 180,
      connections: [
        { targetId: "get-project", label: "GET" },
        { targetId: "update-project", label: "PATCH" },
        { targetId: "update-payout", label: "PATCH" },
        { targetId: "delete-project", label: "DELETE" },
        { targetId: "validate", label: "VALIDATE" },
      ],
      isHub: true,
    },
    // Operations (right side)
    {
      id: "get-project",
      method: "GET",
      path: "/api/projects/[appId]",
      description: "Get Project",
      color: "blue",
      x: 600,
      y: 60,
      connections: [],
    },
    {
      id: "update-project",
      method: "PATCH",
      path: "/api/projects/[appId]",
      description: "Update Project",
      color: "yellow",
      x: 600,
      y: 140,
      connections: [],
    },
    {
      id: "update-payout",
      method: "PATCH",
      path: "/api/projects/[appId]/payTo",
      description: "Update Payout",
      color: "yellow",
      x: 600,
      y: 220,
      connections: [],
    },
    {
      id: "delete-project",
      method: "DELETE",
      path: "/api/projects/[appId]",
      description: "Delete Project",
      color: "red",
      x: 600,
      y: 300,
      connections: [],
    },
    {
      id: "validate",
      method: "GET",
      path: "/api/v1/validate",
      description: "Validate (SDK)",
      color: "blue",
      x: 600,
      y: 380,
      connections: [],
    },
  ]

  const getMethodColor = (color: string, isHub?: boolean) => {
    if (isHub) return "bg-purple-500/25 text-purple-300 border-purple-500/40 shadow-purple-500/20"
    const colors = {
      blue: "bg-blue-500/25 text-blue-300 border-blue-500/40 shadow-blue-500/20",
      green: "bg-green-500/25 text-green-300 border-green-500/40 shadow-green-500/20",
      yellow: "bg-yellow-500/25 text-yellow-300 border-yellow-500/40 shadow-yellow-500/20",
      red: "bg-red-500/25 text-red-300 border-red-500/40 shadow-red-500/20",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getMethodBgColor = (color: string, isHub?: boolean) => {
    if (isHub) return "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent"
    const colors = {
      blue: "bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent",
      green: "bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent",
      yellow: "bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent",
      red: "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "GET":
        return <ArrowRight className="h-3 w-3" />
      case "POST":
        return <Zap className="h-3 w-3" />
      case "PATCH":
        return <GitBranch className="h-3 w-3" />
      case "DELETE":
        return <Zap className="h-3 w-3" />
      case "HUB":
        return <GitBranch className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleCopyEndpoint = (endpoint: string) => {
    const fullUrl = `${window.location.origin}${endpoint}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  // Calculate smooth curved connection lines with labels
  const getConnectionPath = (from: typeof nodes[0], to: typeof nodes[0]) => {
    const nodeWidth = 200
    const nodeHeight = 100
    const fromX = from.x + nodeWidth // Right edge of node
    const fromY = from.y + nodeHeight / 2 // Center Y of node
    const toX = to.x // Left edge of node
    const toY = to.y + nodeHeight / 2 // Center Y of node

    // Calculate control points for smooth curves
    const dx = toX - fromX
    const controlPoint1X = fromX + dx * 0.5
    const controlPoint1Y = fromY
    const controlPoint2X = fromX + dx * 0.5
    const controlPoint2Y = toY

    // Create smooth bezier curve
    return {
      path: `M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`,
      midX: (fromX + toX) / 2,
      midY: (fromY + toY) / 2,
    }
  }

  // Get connection color based on method
  const getConnectionColor = (fromColor: string) => {
    const colors = {
      blue: "rgba(96, 165, 250, 0.5)",
      green: "rgba(74, 222, 128, 0.5)",
      yellow: "rgba(250, 204, 21, 0.5)",
      red: "rgba(248, 113, 113, 0.5)",
    }
    return colors[fromColor as keyof typeof colors] || colors.blue
  }

  return (
    <>
      <BlurFade delay={0} direction="up">
        <div className="mb-4 md:mb-6">
          <h2 className="mb-2 font-sans text-3xl md:text-4xl font-light tracking-tight text-foreground">
            API Endpoints
          </h2>
          <p className="font-mono text-xs md:text-sm text-foreground/60">Visual workflow of API endpoints</p>
        </div>
      </BlurFade>

      {/* Workflow Canvas */}
      <div className="relative overflow-auto rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/5 via-foreground/3 to-foreground/5 backdrop-blur-sm shadow-2xl">
        {/* Grid Background (n8n style) */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Subtle radial gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.1), transparent 70%)",
          }}
        />

        {/* SVG for connections - rendered behind nodes */}
        <svg
          className="absolute inset-0 pointer-events-none z-0"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            {/* Gradient for connection lines */}
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
            {/* Arrow marker */}
            <marker
              id="arrowhead"
              markerWidth="14"
              markerHeight="14"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon
                points="0 0, 14 4, 0 8"
                fill="rgba(255,255,255,0.6)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.5"
                filter="url(#glow)"
              />
            </marker>
            {/* Glow filter for connections */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {nodes.map((node) => (
            <Fragment key={node.id}>
              {node.connections.map((connection) => {
                const targetNode = nodes.find((n) => n.id === connection.targetId)
                if (!targetNode) return null
                const pathData = getConnectionPath(node, targetNode)
                return (
                  <g key={`${node.id}-${connection.targetId}`}>
                  {/* Connection line with glow */}
                  <path
                    d={pathData.path}
                    stroke={getConnectionColor(node.color)}
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="transition-all duration-300"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(255,255,255,0.4))",
                    }}
                  />
                  {/* Connection Label with background */}
                  {connection.label && (
                    <g>
                      <rect
                        x={pathData.midX - 20}
                        y={pathData.midY - 18}
                        width="40"
                        height="16"
                        rx="4"
                        fill="rgba(0,0,0,0.4)"
                        className="backdrop-blur-sm"
                      />
                      <text
                        x={pathData.midX}
                        y={pathData.midY - 6}
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                        style={{
                          fontSize: "10px",
                          fill: "rgba(255,255,255,0.9)",
                          fontWeight: "700",
                          fontFamily: "monospace",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {connection.label}
                      </text>
                    </g>
                  )}
                  </g>
                )
              })}
            </Fragment>
          ))}
        </svg>

        {/* Nodes */}
        <div className="relative min-h-[650px] p-16" style={{ minWidth: "1100px" }}>
          {nodes.map((node, index) => (
            <BlurFade key={node.id} delay={index * 0.08} direction="up">
              <div
                className="absolute z-10 transition-all duration-300 hover:scale-105 hover:z-20"
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: "240px",
                }}
              >
                <MagicCard
                  gradientSize={280}
                  gradientFrom="oklch(0.35 0.15 240)"
                  gradientTo="oklch(0.3 0.13 240)"
                  gradientColor="oklch(0.35 0.15 240)"
                  gradientOpacity={0.2}
                  className="rounded-2xl"
                >
                  <div
                    className={`group relative overflow-hidden rounded-xl border-2 p-4 backdrop-blur-xl transition-all duration-300 hover:border-foreground/50 hover:shadow-xl ${
                      node.isHub
                        ? "border-purple-500/40 bg-gradient-to-br from-purple-500/15 via-purple-500/8 to-transparent shadow-purple-500/20"
                        : getMethodBgColor(node.color, node.isHub) + " border-foreground/25"
                    }`}
                  >
                    {/* Decorative corner accent */}
                    <div
                      className={`absolute top-0 right-0 h-12 w-12 opacity-10 ${
                        node.isHub
                          ? "bg-purple-500"
                          : node.color === "blue"
                            ? "bg-blue-500"
                            : node.color === "green"
                              ? "bg-green-500"
                              : node.color === "yellow"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                      }`}
                      style={{
                        clipPath: "polygon(100% 0, 100% 100%, 0 0)",
                      }}
                    />

                    {/* Method Badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 font-mono text-xs font-bold shadow-lg backdrop-blur-sm ${
                          node.isHub
                            ? "bg-purple-500/25 text-purple-200 border-purple-500/40 shadow-purple-500/30"
                            : getMethodColor(node.color, node.isHub)
                        }`}
                      >
                        {getMethodIcon(node.method)}
                        {node.method}
                      </span>
                    </div>

                    {/* Endpoint Path */}
                    <code className="mb-3 block break-all font-mono text-xs font-semibold text-foreground leading-tight">
                      {node.path}
                    </code>

                    {/* Description */}
                    <p className="mb-3 font-sans text-xs leading-relaxed text-foreground/70">
                      {node.description}
                    </p>

                    {/* Connection indicator */}
                    {node.connections.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 border-t border-foreground/15 pt-3">
                        <div className="flex gap-1">
                          {[...Array(Math.min(node.connections.length, 3))].map((_, i) => (
                            <div
                              key={i}
                              className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground/60 shadow-sm"
                              style={{
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: "2s",
                              }}
                            />
                          ))}
                          {node.connections.length > 3 && (
                            <span className="ml-1 font-mono text-xs text-foreground/40">
                              +{node.connections.length - 3}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-medium text-foreground/60">
                          {node.connections.length} output{node.connections.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </MagicCard>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </>
  )
}

const COMPONENTS = [
  {
    id: 1,
    name: "PaymentModal",
    description: "React component for handling x402 payments with wallet integration",
    import: "import { PaymentModal } from '@x402-devkit/client/react'",
    code: `import { PaymentModal } from '@x402-devkit/client/react'

function MyComponent() {
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const handlePayment = async () => {
    // Trigger payment request (e.g., from API 402 response)
    setPaymentRequest({
      amount: "0.001",
      token: "MNT",
      network: "mantle",
      recipient: "0xB27705342ACE73736AE490540Ea031cc06C3eF49"
    })
    setIsOpen(true)
  }

  return (
    <>
      <button onClick={handlePayment}>Pay for API</button>
      <PaymentModal
        request={paymentRequest}
        isOpen={isOpen}
        onComplete={(payment) => {
          console.log('Payment completed:', payment.transactionHash)
          setIsOpen(false)
        }}
        onCancel={() => setIsOpen(false)}
      />
    </>
  )
}`,
    props: [
      { name: "request", type: "PaymentRequest", required: true, description: "Payment request object with amount, token, network, and recipient" },
      { name: "isOpen", type: "boolean", required: true, description: "Controls modal visibility" },
      { name: "onComplete", type: "(payment: PaymentResponse) => void", required: true, description: "Callback when payment is completed" },
      { name: "onCancel", type: "() => void", required: true, description: "Callback when user cancels payment" },
    ],
  },
]

function CodeBlock({ code, onCopy }: { code: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy()
  }

  return (
    <div className="my-4 flex rounded-lg border border-foreground/10 bg-foreground/10 overflow-hidden">
      <pre className="flex-1 overflow-x-auto p-4">
        <code className="font-mono text-xs text-foreground/90">{code}</code>
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

export function LogsTab() {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Show the first component (PaymentModal) directly
  const component = COMPONENTS[0]

  return (
    <>
      <BlurFade delay={0} direction="up">
        <div className="mb-6">
          <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl">
            {component.name}
          </h2>
          <p className="font-mono text-sm text-foreground/60">Integration examples and previews</p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <MagicCard
          gradientSize={300}
          gradientFrom="oklch(0.35 0.15 240)"
          gradientTo="oklch(0.3 0.13 240)"
          gradientColor="oklch(0.35 0.15 240)"
          gradientOpacity={0.15}
          className="rounded-2xl"
        >
          <div className="rounded-2xl border border-foreground/20 bg-foreground/5 p-8 backdrop-blur-xl">
            {/* Header with Preview Button */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <p className="font-sans text-base text-foreground flex-1">{component.description}</p>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20 flex-shrink-0"
              >
                <Play className="h-4 w-4" />
                Preview Component
              </button>
            </div>
            
            <div className="mb-6">
              <div className="mb-4">
                <p className="font-mono text-xs text-foreground/60 mb-2">Import</p>
                <CodeBlock code={component.import} onCopy={() => setCopied(true)} />
              </div>
              <div className="mb-4">
                <p className="font-mono text-xs text-foreground/60 mb-2">Usage Example</p>
                <CodeBlock code={component.code} onCopy={() => setCopied(true)} />
              </div>
              <div className="mb-4">
                <p className="font-mono text-xs text-foreground/60 mb-2">Props</p>
                <div className="space-y-2">
                  {component.props.map((prop, idx) => (
                    <div key={idx} className="rounded-lg border border-foreground/10 bg-foreground/5 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono text-xs text-foreground">{prop.name}</code>
                        <span className="font-mono text-xs text-foreground/50">({prop.type})</span>
                        {prop.required && (
                          <span className="font-mono text-xs text-red-500/80">required</span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-foreground/60">{prop.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </MagicCard>
      </BlurFade>

      <PaymentModal
        isOpen={showModal}
        simulation={true}
        request={{
          amount: "0.001",
          token: "MNT",
          network: "mantle",
          recipient: "0xB27705342ACE73736AE490540Ea031cc06C3eF49",
          description: "Preview payment modal (Simulation)",
          endpoint: "/api/premium-data",
        }}
        onComplete={(payment) => {
          console.log("Simulated payment completed:", payment.transactionHash)
          // Auto-close after showing success for a moment
          setTimeout(() => {
            setShowModal(false)
          }, 3000)
        }}
        onCancel={() => setShowModal(false)}
      />
    </>
  )
}

export function SettingsTab() {
  const { user, logout } = usePrivy()
  const { sidebarOpen, setSidebarOpen } = useDashboard()
  const [copied, setCopied] = useState(false)
  const [defaultNetwork, setDefaultNetwork] = useState<"mantle-sepolia" | "mantle">("mantle-sepolia")
  const [autoCollapseSidebar, setAutoCollapseSidebar] = useState(false)
  const [defaultTab, setDefaultTab] = useState<"overview" | "docs" | "components">("overview")
  const [showProjectIds, setShowProjectIds] = useState(true)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      <BlurFade delay={0} direction="up">
        <div className="mb-6">
          <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl">
            Settings
          </h2>
          <p className="font-mono text-sm text-foreground/60">Manage your account and preferences</p>
        </div>
      </BlurFade>

      <div className="space-y-6">
        {/* Account Settings */}
        <BlurFade delay={0.1} direction="up">
          <MagicCard
            gradientSize={200}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.1}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <Wallet className="h-5 w-5 text-foreground/60" />
                <h3 className="font-sans text-xl font-light text-foreground">Account</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-mono text-xs text-foreground/60">Connected Wallet</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm text-foreground">
                      {user?.wallet?.address ? formatAddress(user.wallet.address) : "Not connected"}
                    </code>
                    {user?.wallet?.address && (
                      <button
                        onClick={() => handleCopy(user?.wallet?.address || "")}
                        className="text-foreground/60 transition-colors hover:text-foreground flex-shrink-0"
                        title="Copy address"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {user?.wallet?.address && (
                  <div>
                    <p className="mb-2 font-mono text-xs text-foreground/60">Full Address</p>
                    <code className="block break-all font-mono text-xs text-foreground/80">
                      {user.wallet.address}
                    </code>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        {/* Network Settings */}
        <BlurFade delay={0.2} direction="up">
          <MagicCard
            gradientSize={200}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.1}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <Network className="h-5 w-5 text-foreground/60" />
                <h3 className="font-sans text-xl font-light text-foreground">Network</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="mb-2 font-mono text-xs text-foreground/60">Default Network</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDefaultNetwork("mantle-sepolia")}
                      className={`flex-1 rounded-lg border px-4 py-2 font-sans text-sm transition-colors ${
                        defaultNetwork === "mantle-sepolia"
                          ? "border-foreground/30 bg-foreground/15 text-foreground"
                          : "border-foreground/10 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                      }`}
                    >
                      Mantle Sepolia
                    </button>
                    <button
                      onClick={() => setDefaultNetwork("mantle")}
                      className={`flex-1 rounded-lg border px-4 py-2 font-sans text-sm transition-colors ${
                        defaultNetwork === "mantle"
                          ? "border-foreground/30 bg-foreground/15 text-foreground"
                          : "border-foreground/10 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                      }`}
                    >
                      Mantle Mainnet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        {/* UI Preferences */}
        <BlurFade delay={0.3} direction="up">
          <MagicCard
            gradientSize={200}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.1}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <Sidebar className="h-5 w-5 text-foreground/60" />
                <h3 className="font-sans text-xl font-light text-foreground">UI Preferences</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-sm text-foreground">Sidebar</p>
                    <p className="font-mono text-xs text-foreground/60">Toggle sidebar visibility</p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`rounded-lg border px-4 py-2 font-sans text-sm transition-colors ${
                      sidebarOpen
                        ? "border-foreground/30 bg-foreground/15 text-foreground"
                        : "border-foreground/10 bg-foreground/5 text-foreground/70"
                    }`}
                  >
                    {sidebarOpen ? "Open" : "Closed"}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-sm text-foreground">Auto-collapse Sidebar</p>
                    <p className="font-mono text-xs text-foreground/60">Automatically collapse on small screens</p>
                  </div>
                  <button
                    onClick={() => setAutoCollapseSidebar(!autoCollapseSidebar)}
                    className={`rounded-lg border px-4 py-2 font-sans text-sm transition-colors ${
                      autoCollapseSidebar
                        ? "border-foreground/30 bg-foreground/15 text-foreground"
                        : "border-foreground/10 bg-foreground/5 text-foreground/70"
                    }`}
                  >
                    {autoCollapseSidebar ? "On" : "Off"}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-sm text-foreground">Show APP Ids</p>
                    <p className="font-mono text-xs text-foreground/60">Display APP Ids by default</p>
                  </div>
                  <button
                    onClick={() => setShowProjectIds(!showProjectIds)}
                    className="flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground"
                  >
                    {showProjectIds ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                <div>
                  <p className="mb-2 font-sans text-sm text-foreground">Default Dashboard Tab</p>
                  <div className="flex gap-2">
                    {(["overview", "docs", "components"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setDefaultTab(tab)}
                        className={`flex-1 rounded-lg border px-4 py-2 font-sans text-sm capitalize transition-colors ${
                          defaultTab === tab
                            ? "border-foreground/30 bg-foreground/15 text-foreground"
                            : "border-foreground/10 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        {/* About */}
        <BlurFade delay={0.4} direction="up">
          <MagicCard
            gradientSize={200}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.1}
            className="rounded-xl"
          >
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-sans text-xl font-light text-foreground">About</h3>
              <div className="space-y-2 font-mono text-xs text-foreground/60">
                <p>Mantle DevKit Dashboard</p>
                <p>Version 1.0.0</p>
                <p className="pt-2 text-foreground/50">x402 + Agent Kit for Mantle</p>
              </div>
            </div>
          </MagicCard>
        </BlurFade>
      </div>
    </>
  )
}
