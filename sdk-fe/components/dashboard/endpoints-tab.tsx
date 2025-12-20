"use client"

import { useState, useEffect } from "react"
import { useDashboard } from "@/contexts/dashboard-context"
import { Copy, Check, ExternalLink, TrendingUp, Activity, DollarSign } from "lucide-react"

interface EndpointStat {
  endpoint: string
  totalPayments: number
  methods: Array<{ method: string | null; count: number }>
  recentPayments: Array<{
    id: string
    endpoint: string
    method: string | null
    amount: string
    token: string
    transactionHash: string
    createdAt: string
  }>
  isActive?: boolean
  lastSeen?: string | null
}

interface EndpointsData {
  endpoints: EndpointStat[]
  totalEndpoints: number
  activeEndpoints?: number
  period: string
}

export function EndpointsTab() {
  const { selectedProject } = useDashboard()
  const [endpointsData, setEndpointsData] = useState<EndpointsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  useEffect(() => {
    if (selectedProject?.appId) {
      loadEndpoints()
    } else {
      setIsLoading(false)
    }
  }, [selectedProject])

  const loadEndpoints = async () => {
    if (!selectedProject?.appId) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/projects/${selectedProject.appId}/endpoints?days=30`
      )

      if (!response.ok) {
        throw new Error('Failed to load endpoint statistics')
      }

      const data = await response.json()
      setEndpointsData(data)
    } catch (err) {
      console.error('Error loading endpoints:', err)
      setError(err instanceof Error ? err.message : 'Failed to load endpoints')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(hash)
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getExplorerUrl = (hash: string, network: string) => {
    if (network.includes('sepolia') || network.includes('testnet')) {
      return `https://explorer.sepolia.mantle.xyz/tx/${hash}`
    }
    return `https://explorer.mantle.xyz/tx/${hash}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full border border-foreground/20 bg-foreground/5 p-6">
          <Activity className="h-12 w-12 text-foreground/40" />
        </div>
        <h3 className="mb-2 font-sans text-xl font-light text-foreground">
          No Project Selected
        </h3>
        <p className="mb-6 max-w-md font-mono text-sm text-foreground/60">
          Select a project to view endpoint usage statistics.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        <p className="font-sans text-sm text-foreground/60">Loading endpoint statistics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full border border-red-500/30 bg-red-500/10 p-6">
          <Activity className="h-12 w-12 text-red-500/60" />
        </div>
        <h3 className="mb-2 font-sans text-xl font-light text-foreground">Error</h3>
        <p className="mb-6 max-w-md font-mono text-sm text-red-500/80">{error}</p>
        <button
          onClick={loadEndpoints}
          className="rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!endpointsData || endpointsData.endpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full border border-foreground/20 bg-foreground/5 p-6">
          <Activity className="h-12 w-12 text-foreground/40" />
        </div>
        <h3 className="mb-2 font-sans text-xl font-light text-foreground">
          No Endpoint Activity
        </h3>
        <p className="mb-6 max-w-md font-mono text-sm text-foreground/60">
          No endpoints have been tracked yet. Endpoints will automatically appear here when:
        </p>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4 text-left max-w-md">
          <p className="mb-2 font-mono text-xs text-foreground/60">Automatic Tracking:</p>
          <ol className="list-decimal list-inside space-y-1 font-mono text-xs text-foreground/80">
            <li>Add x402 middleware to your API routes</li>
            <li>When the endpoint is first accessed, it's automatically registered</li>
            <li>Endpoints appear here even before payments are made</li>
            <li>Payment statistics update in real-time</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="mb-2 font-sans text-2xl font-light text-foreground">
          Endpoint Tracking
        </h2>
        <p className="font-mono text-sm text-foreground/60">
          Monitor which API endpoints are generating revenue ({endpointsData.period})
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-foreground/60" />
            <p className="font-mono text-xs text-foreground/60">Active Endpoints</p>
          </div>
          <p className="font-sans text-2xl font-light text-foreground">
            {endpointsData.activeEndpoints ?? endpointsData.endpoints.filter(e => e.isActive !== false).length}
          </p>
          {endpointsData.totalEndpoints > (endpointsData.activeEndpoints ?? 0) && (
            <p className="font-mono text-xs text-foreground/50 mt-1">
              {endpointsData.totalEndpoints - (endpointsData.activeEndpoints ?? 0)} inactive
            </p>
          )}
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-foreground/60" />
            <p className="font-mono text-xs text-foreground/60">Total Payments</p>
          </div>
          <p className="font-sans text-2xl font-light text-foreground">
            {endpointsData.endpoints.reduce((sum, e) => sum + e.totalPayments, 0)}
          </p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-foreground/60" />
            <p className="font-mono text-xs text-foreground/60">Period</p>
          </div>
          <p className="font-sans text-2xl font-light text-foreground">
            {endpointsData.period}
          </p>
        </div>
      </div>

      {/* Endpoint List */}
      <div className="space-y-4">
        {endpointsData.endpoints.map((endpointStat, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm"
          >
            {/* Endpoint Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <code className="font-mono text-base text-foreground">
                    {endpointStat.endpoint || 'Unknown Endpoint'}
                  </code>
                  {endpointStat.methods.length > 0 && (
                    <span className="rounded border border-foreground/20 bg-foreground/10 px-2 py-0.5 font-mono text-xs text-foreground/60">
                      {endpointStat.methods.map((m) => m.method || 'ANY').join(', ')}
                    </span>
                  )}
                  {endpointStat.isActive === false && (
                    <span className="rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 font-mono text-xs text-yellow-500/80">
                      INACTIVE
                    </span>
                  )}
                  {endpointStat.isActive !== false && (
                    <span className="rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-mono text-xs text-green-500/80">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-mono text-xs text-foreground/60">
                    {endpointStat.totalPayments} payment{endpointStat.totalPayments !== 1 ? 's' : ''}
                  </p>
                  {endpointStat.lastSeen && (
                    <p className="font-mono text-xs text-foreground/50">
                      Last seen: {formatDate(endpointStat.lastSeen)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Method Breakdown */}
            {endpointStat.methods.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {endpointStat.methods.map((method, midx) => (
                  <div
                    key={midx}
                    className="rounded border border-foreground/10 bg-foreground/5 px-2 py-1"
                  >
                    <span className="font-mono text-xs text-foreground/60">
                      {method.method || 'ANY'}: {method.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Payments */}
            {endpointStat.recentPayments.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-xs text-foreground/60">Recent Payments</p>
                <div className="space-y-2">
                  {endpointStat.recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded border border-foreground/10 bg-foreground/5 p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-foreground">
                            {payment.amount} {payment.token}
                          </span>
                          <span className="font-mono text-xs text-foreground/50">
                            {formatDate(payment.createdAt)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="font-mono text-xs text-foreground/60 truncate">
                            {payment.transactionHash.slice(0, 16)}...
                          </code>
                          <button
                            onClick={() => handleCopyHash(payment.transactionHash)}
                            className="text-foreground/40 transition-colors hover:text-foreground/60"
                            title="Copy transaction hash"
                          >
                            {copiedHash === payment.transactionHash ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                          <a
                            href={getExplorerUrl(payment.transactionHash, selectedProject.network)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/40 transition-colors hover:text-foreground/60"
                            title="View on explorer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

