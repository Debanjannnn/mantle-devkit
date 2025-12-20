import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/projects/[appId]/endpoints
 * 
 * Get endpoint usage statistics for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Find project
    const project = await prisma.project.findUnique({
      where: { appId },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get active endpoints (registered endpoints that are still active)
    // Also auto-mark endpoints as INACTIVE if they haven't been seen in 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // Auto-deactivate old endpoints (endpoints that haven't been accessed in 7 days)
    await (prisma as any).endpoint.updateMany({
      where: {
        projectId: project.id,
        status: 'ACTIVE',
        lastSeen: {
          lt: sevenDaysAgo,
        },
      },
      data: {
        status: 'INACTIVE',
      },
    })

    const activeEndpoints = await (prisma as any).endpoint.findMany({
      where: {
        projectId: project.id,
        status: 'ACTIVE',
      },
      orderBy: { lastSeen: 'desc' },
    })

    // Get endpoint statistics from payments
    const endpointStats = await (prisma as any).payment.groupBy({
      by: ['endpoint', 'method'],
      where: {
        projectId: project.id,
        createdAt: {
          gte: startDate,
        },
        status: 'SUCCESS',
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    // Get total payments per endpoint
    const endpointTotals = await (prisma as any).payment.groupBy({
      by: ['endpoint'],
      where: {
        projectId: project.id,
        createdAt: {
          gte: startDate,
        },
        status: 'SUCCESS',
        endpoint: { not: null },
      },
      _count: {
        id: true,
      },
    })

    // Get recent payments for each endpoint
    const recentPayments = await (prisma as any).payment.findMany({
      where: {
        projectId: project.id,
        createdAt: {
          gte: startDate,
        },
        status: 'SUCCESS',
        endpoint: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        endpoint: true,
        method: true,
        amount: true,
        token: true,
        transactionHash: true,
        createdAt: true,
      },
    })

    // Create a map of active endpoints for quick lookup
    const activeEndpointMap = new Map(
      activeEndpoints.map((ep: any) => [`${ep.endpoint}:${ep.method || 'ANY'}`, ep])
    )

    // Format endpoint statistics - only show active endpoints or endpoints with recent payments
    const endpoints = endpointTotals
      .map((stat: any) => {
        const methods = endpointStats.filter((s: any) => s.endpoint === stat.endpoint)
        const recent = recentPayments.filter((p: any) => p.endpoint === stat.endpoint).slice(0, 10)

        // Check if this endpoint is still active
        const endpointKey = `${stat.endpoint}:${methods[0]?.method || 'ANY'}`
        const isActive = activeEndpointMap.has(endpointKey) || 
                        activeEndpoints.some((ep: any) => ep.endpoint === stat.endpoint)

        return {
          endpoint: stat.endpoint,
          totalPayments: stat._count.id,
          methods: methods.map((m: any) => ({
            method: m.method,
            count: m._count.id,
          })),
          recentPayments: recent,
          isActive, // Whether endpoint is still registered as active
          lastSeen: activeEndpoints.find((ep: any) => ep.endpoint === stat.endpoint)?.lastSeen || null,
        }
      })
      // Filter: Show active endpoints OR endpoints with payments in the selected period
      .filter((ep: any) => ep.isActive || ep.totalPayments > 0)

    // Also include active endpoints that haven't received payments yet
    const endpointsWithoutPayments = activeEndpoints
      .filter((ep: any) => !endpoints.some((e: any) => e.endpoint === ep.endpoint))
      .map((ep: any) => ({
        endpoint: ep.endpoint,
        totalPayments: 0,
        methods: ep.method ? [{ method: ep.method, count: 0 }] : [],
        recentPayments: [],
        isActive: true,
        lastSeen: ep.lastSeen,
      }))

    const allEndpoints = [...endpoints, ...endpointsWithoutPayments]

    return NextResponse.json({
      endpoints: allEndpoints,
      totalEndpoints: allEndpoints.length,
      activeEndpoints: allEndpoints.filter((e: any) => e.isActive).length,
      period: `${days} days`,
    })
  } catch (error) {
    console.error('Error fetching endpoint statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch endpoint statistics' },
      { status: 500 }
    )
  }
}

