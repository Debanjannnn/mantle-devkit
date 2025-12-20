"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle, Clock, XCircle, ExternalLink, TrendingUp, TrendingDown, Users, Zap, DollarSign, Activity, Code, Copy, Check, Play } from "lucide-react"

// Mock analytics data
const DAILY_REVENUE = [
  { day: "Mon", amount: 0.042 },
  { day: "Tue", amount: 0.068 },
  { day: "Wed", amount: 0.055 },
  { day: "Thu", amount: 0.089 },
  { day: "Fri", amount: 0.102 },
  { day: "Sat", amount: 0.078 },
  { day: "Sun", amount: 0.024 },
]

const TOP_ENDPOINTS = [
  { endpoint: "/api/premium/data", calls: 1247, revenue: "0.125 MNT", percentage: 42 },
  { endpoint: "/api/premium/analytics", calls: 892, revenue: "0.089 MNT", percentage: 30 },
  { endpoint: "/api/premium/export", calls: 534, revenue: "0.053 MNT", percentage: 18 },
  { endpoint: "/api/premium/upload", calls: 298, revenue: "0.030 MNT", percentage: 10 },
]

const RECENT_ACTIVITY = [
  { type: "payment", message: "Payment received from 0x742d...3a9F", time: "2 min ago", amount: "+0.001 MNT" },
  { type: "user", message: "New user connected: 0x1234...5678", time: "5 min ago", amount: null },
  { type: "payment", message: "Payment received from 0xaBcD...eF12", time: "8 min ago", amount: "+0.002 MNT" },
  { type: "milestone", message: "Milestone reached: 100 total payments", time: "1 hour ago", amount: null },
  { type: "payment", message: "Payment received from 0x9876...5432", time: "2 hours ago", amount: "+0.005 MNT" },
]

export function AnalyticsTab() {
  const maxRevenue = Math.max(...DAILY_REVENUE.map(d => d.amount))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-sans text-2xl font-light text-foreground">Analytics</h2>
        <p className="font-mono text-sm text-foreground/60">Monitor your API performance and revenue</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-foreground/60">Total Revenue</p>
            <DollarSign className="h-4 w-4 text-foreground/40" />
          </div>
          <p className="font-sans text-2xl font-light text-foreground">0.458 MNT</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="font-mono text-xs text-green-500">+12.5%</span>
            <span className="font-mono text-xs text-foreground/40">vs last week</span>
          </div>
        </div>

        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-foreground/60">API Calls</p>
            <Zap className="h-4 w-4 text-foreground/40" />
          </div>
          <p className="font-sans text-2xl font-light text-foreground">2,971</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="font-mono text-xs text-green-500">+8.2%</span>
            <span className="font-mono text-xs text-foreground/40">vs last week</span>
          </div>
        </div>

        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-foreground/60">Unique Users</p>
            <Users className="h-4 w-4 text-foreground/40" />
          </div>
          <p className="font-sans text-2xl font-light text-foreground">142</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="font-mono text-xs text-green-500">+24.3%</span>
            <span className="font-mono text-xs text-foreground/40">vs last week</span>
          </div>
        </div>

        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-foreground/60">Avg. Response</p>
            <Activity className="h-4 w-4 text-foreground/40" />
          </div>
          <p className="font-sans text-2xl font-light text-foreground">124ms</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="h-3 w-3 text-green-500" />
            <span className="font-mono text-xs text-green-500">-15ms</span>
            <span className="font-mono text-xs text-foreground/40">vs last week</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <h3 className="font-sans text-sm font-medium text-foreground mb-4">Daily Revenue (MNT)</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {DAILY_REVENUE.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-32">
                  <div
                    className="w-full bg-foreground/20 rounded-t-sm hover:bg-foreground/30 transition-colors"
                    style={{ height: `${(day.amount / maxRevenue) * 100}%` }}
                    title={`${day.amount} MNT`}
                  />
                </div>
                <span className="font-mono text-xs text-foreground/50">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Endpoints */}
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <h3 className="font-sans text-sm font-medium text-foreground mb-4">Top Endpoints</h3>
          <div className="space-y-3">
            {TOP_ENDPOINTS.map((endpoint) => (
              <div key={endpoint.endpoint}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-foreground/80 truncate">{endpoint.endpoint}</span>
                  <span className="font-mono text-xs text-foreground/60">{endpoint.revenue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/30 rounded-full"
                      style={{ width: `${endpoint.percentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-foreground/40 w-8">{endpoint.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-foreground/10 bg-foreground/5 overflow-hidden">
        <div className="border-b border-foreground/10 bg-foreground/5 px-4 py-3">
          <h3 className="font-sans text-sm font-medium text-foreground">Recent Activity</h3>
        </div>
        <div className="divide-y divide-foreground/10">
          {RECENT_ACTIVITY.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-1.5 ${
                  activity.type === "payment" ? "bg-green-500/10" :
                  activity.type === "user" ? "bg-blue-500/10" : "bg-yellow-500/10"
                }`}>
                  {activity.type === "payment" ? (
                    <DollarSign className="h-3.5 w-3.5 text-green-500" />
                  ) : activity.type === "user" ? (
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-sm text-foreground">{activity.message}</p>
                  <p className="font-mono text-xs text-foreground/50">{activity.time}</p>
                </div>
              </div>
              {activity.amount && (
                <span className="font-mono text-sm text-green-500">{activity.amount}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mock notice */}
      <p className="text-center font-mono text-xs text-foreground/40">
        Showing mock data • Real analytics will appear when transactions occur
      </p>
    </div>
  )
}

// Mock payment flow data
const MOCK_PAYMENTS = [
  {
    id: "pay_1a2b3c4d",
    from: "0x742d...3a9F",
    to: "0xDacC...08E1",
    amount: "0.001",
    token: "MNT",
    status: "completed",
    endpoint: "/api/premium/data",
    timestamp: "2 min ago",
    txHash: "0x8f3d...2e1a",
  },
  {
    id: "pay_2b3c4d5e",
    from: "0x1234...5678",
    to: "0xDacC...08E1",
    amount: "0.005",
    token: "MNT",
    status: "completed",
    endpoint: "/api/premium/analytics",
    timestamp: "5 min ago",
    txHash: "0x7c2e...9f3b",
  },
  {
    id: "pay_3c4d5e6f",
    from: "0xaBcD...eF12",
    to: "0xDacC...08E1",
    amount: "0.002",
    token: "MNT",
    status: "pending",
    endpoint: "/api/premium/export",
    timestamp: "8 min ago",
    txHash: "0x4a1b...8c2d",
  },
  {
    id: "pay_4d5e6f7g",
    from: "0x9876...5432",
    to: "0xDacC...08E1",
    amount: "0.001",
    token: "MNT",
    status: "completed",
    endpoint: "/api/premium/data",
    timestamp: "12 min ago",
    txHash: "0x2f3e...7d4c",
  },
  {
    id: "pay_5e6f7g8h",
    from: "0xFeDc...bA98",
    to: "0xDacC...08E1",
    amount: "0.003",
    token: "MNT",
    status: "failed",
    endpoint: "/api/premium/upload",
    timestamp: "15 min ago",
    txHash: "0x1e2f...6b5a",
  },
]

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "Completed",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: "Pending",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Failed",
  },
}

export function EndpointsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-2xl font-light text-foreground">Payment Flows</h2>
          <p className="font-mono text-sm text-foreground/60">Track all payment transactions for your endpoints</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 font-mono text-xs text-green-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <p className="font-mono text-xs text-foreground/60">Total Payments</p>
          <p className="font-sans text-2xl font-light text-foreground">127</p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <p className="font-mono text-xs text-foreground/60">Total Volume</p>
          <p className="font-sans text-2xl font-light text-foreground">0.458 MNT</p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <p className="font-mono text-xs text-foreground/60">Success Rate</p>
          <p className="font-sans text-2xl font-light text-foreground">98.4%</p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <p className="font-mono text-xs text-foreground/60">Active Endpoints</p>
          <p className="font-sans text-2xl font-light text-foreground">4</p>
        </div>
      </div>

      {/* Payment Flows Table */}
      <div className="rounded-lg border border-foreground/10 bg-foreground/5 overflow-hidden">
        <div className="border-b border-foreground/10 bg-foreground/5 px-4 py-3">
          <h3 className="font-sans text-sm font-medium text-foreground">Recent Payment Flows</h3>
        </div>
        <div className="divide-y divide-foreground/10">
          {MOCK_PAYMENTS.map((payment) => {
            const statusConfig = STATUS_CONFIG[payment.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = statusConfig.icon
            return (
              <div key={payment.id} className="flex items-center gap-4 px-4 py-3 hover:bg-foreground/5 transition-colors">
                {/* Status */}
                <div className={`rounded-full p-1.5 ${statusConfig.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                </div>

                {/* Flow */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-foreground">{payment.from}</span>
                    <ArrowRight className="h-3 w-3 text-foreground/40" />
                    <span className="font-mono text-sm text-foreground">{payment.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-foreground/50">{payment.endpoint}</span>
                    <span className="text-foreground/30">•</span>
                    <span className="font-mono text-xs text-foreground/50">{payment.timestamp}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-foreground">
                    {payment.amount} {payment.token}
                  </p>
                  <p className={`font-mono text-xs ${statusConfig.color}`}>{statusConfig.label}</p>
                </div>

                {/* Link */}
                <button
                  className="rounded-lg p-2 text-foreground/40 hover:bg-foreground/10 hover:text-foreground transition-colors"
                  title="View on Explorer"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mock notice */}
      <p className="text-center font-mono text-xs text-foreground/40">
        Showing mock data • Real payment flows will appear when transactions occur
      </p>
    </div>
  )
}

// Mock PaymentModal component for demonstration
// In production, this would be imported from @x402-devkit/client/react
function PaymentModalDemo({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border border-foreground/20 bg-foreground/5 p-6 shadow-lg backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/15">
              <span className="font-mono text-sm font-bold text-foreground">x402</span>
            </div>
            <h2 className="font-sans text-xl font-light text-foreground">Payment Required</h2>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/60 transition-colors hover:text-foreground"
          >
            ×
          </button>
        </div>
        <div className="mb-4 space-y-3 rounded-lg border border-foreground/10 bg-foreground/5 p-4">
          <div className="flex justify-between">
            <span className="font-mono text-xs text-foreground/60">Amount</span>
            <span className="font-sans text-base font-medium text-foreground">0.001 MNT</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-xs text-foreground/60">Network</span>
            <span className="font-mono text-sm text-foreground">Mantle Sepolia</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-xs text-foreground/60">Recipient</span>
            <span className="font-mono text-sm text-foreground">0x742d...3a9F</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2 font-sans text-sm text-foreground/80 transition-colors hover:bg-foreground/10"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20"
          >
            Pay 0.001 MNT
          </button>
        </div>
      </div>
    </div>
  )
}

const COMPONENT_EXAMPLES = [
  {
    name: "PaymentModal",
    description: "React component for handling x402 payments with wallet integration",
    import: "import { PaymentModal } from '@x402-devkit/client/react'",
    code: `import { useState } from 'react'
import { PaymentModal } from '@x402-devkit/client/react'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState(null)

  const handlePayment = async () => {
    // Trigger payment request (e.g., from API 402 response)
    setPaymentRequest({
      amount: '0.001',
      token: 'MNT',
      network: 'mantle',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
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

export function LogsTab() {
  const [selectedComponent, setSelectedComponent] = useState(0)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const component = COMPONENT_EXAMPLES[selectedComponent]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2 font-sans text-2xl font-light text-foreground">React Components</h2>
        <p className="font-mono text-sm text-foreground/60">
          Browse and test React components from x402 DevKit
        </p>
      </div>

      {/* Component Selector */}
      <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
        <div className="flex flex-wrap gap-2">
          {COMPONENT_EXAMPLES.map((comp, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedComponent(idx)}
              className={`rounded-lg border px-4 py-2 font-sans text-sm transition-colors ${
                selectedComponent === idx
                  ? "border-foreground/40 bg-foreground/10 text-foreground"
                  : "border-foreground/20 bg-background text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              {comp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Component Details */}
      <div className="space-y-6">
        {/* Component Info */}
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="mb-1 font-sans text-xl font-light text-foreground">{component.name}</h3>
              <p className="font-mono text-sm text-foreground/60">{component.description}</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
            >
              <Play className="h-4 w-4" />
              Preview
            </button>
          </div>

          {/* Import Statement */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-xs text-foreground/60">Import</p>
              <button
                onClick={() => handleCopy(component.import, -1)}
                className="text-foreground/60 transition-colors hover:text-foreground"
                title="Copy import"
              >
                {copiedIndex === -1 ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-background p-3">
              <code className="font-mono text-sm text-foreground/90">{component.import}</code>
            </div>
          </div>

          {/* Code Example */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-xs text-foreground/60">Example Usage</p>
              <button
                onClick={() => handleCopy(component.code, 0)}
                className="text-foreground/60 transition-colors hover:text-foreground"
                title="Copy code"
              >
                {copiedIndex === 0 ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-background p-4">
              <pre className="overflow-x-auto">
                <code className="font-mono text-sm text-foreground/90">{component.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6">
          <h3 className="mb-4 font-sans text-lg font-light text-foreground">Props</h3>
          <div className="space-y-4">
            {component.props.map((prop, idx) => (
              <div key={idx} className="border-b border-foreground/10 pb-4 last:border-0">
                <div className="mb-2 flex items-center gap-2">
                  <code className="font-mono text-sm font-medium text-foreground">{prop.name}</code>
                  <span className="font-mono text-xs text-foreground/40">({prop.type})</span>
                  {prop.required && (
                    <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-xs text-red-500">
                      required
                    </span>
                  )}
                </div>
                <p className="font-mono text-sm text-foreground/70">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Preview */}
      <PaymentModalDemo isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

export function SettingsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="mb-2 font-sans text-2xl font-light text-foreground">Settings</h2>
      <p className="font-mono text-sm text-foreground/60">Coming soon...</p>
    </div>
  )
}


