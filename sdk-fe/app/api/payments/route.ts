import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/payments
 * 
 * Log a payment event for endpoint tracking
 * Called by server SDK after successful payment verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      appId,
      transactionHash,
      amount,
      token,
      network,
      endpoint,
      method,
      fromAddress,
      toAddress,
      blockNumber,
      status = 'SUCCESS',
    } = body

    // Validate required fields
    if (!appId || !transactionHash || !amount || !token || !network || !toAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: appId, transactionHash, amount, token, network, toAddress' },
        { status: 400 }
      )
    }

    // Find project by appId
    const project = await prisma.project.findUnique({
      where: { appId },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if payment already exists (idempotency)
    const existingPayment = await (prisma as any).payment.findUnique({
      where: { transactionHash },
    })

    if (existingPayment) {
      return NextResponse.json(existingPayment, { status: 200 })
    }

    // Create payment record
    const payment = await (prisma as any).payment.create({
      data: {
        projectId: project.id,
        transactionHash,
        amount,
        token,
        network,
        endpoint: endpoint || null,
        method: method || null,
        fromAddress: fromAddress || null,
        toAddress,
        blockNumber: blockNumber || null,
        status,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Error logging payment:', error)

    // Handle unique constraint violation (duplicate transaction hash)
    if (error.code === 'P2002') {
      // Payment already exists, return it
      const existingPayment = await (prisma as any).payment.findUnique({
        where: { transactionHash: body.transactionHash },
      })
      if (existingPayment) {
        return NextResponse.json(existingPayment, { status: 200 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to log payment' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments?appId=xxx&endpoint=xxx
 * 
 * Get payment history for a project, optionally filtered by endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('appId')
    const endpoint = searchParams.get('endpoint')

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      )
    }

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

    // Build query
    const where: any = {
      projectId: project.id,
    }

    if (endpoint) {
      where.endpoint = endpoint
    }

    // Get payments
    const payments = await (prisma as any).payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 payments
    })

    // Get endpoint statistics
    const endpointStats = await (prisma as any).payment.groupBy({
      by: ['endpoint'],
      where: {
        projectId: project.id,
        endpoint: { not: null },
      },
      _count: {
        id: true,
      },
      _sum: {
        // Note: amount is stored as string, so we can't sum it directly
        // This would need to be calculated in application code
      },
    })

    return NextResponse.json({
      payments,
      endpointStats: endpointStats.map((stat) => ({
        endpoint: stat.endpoint,
        count: stat._count.id,
      })),
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

