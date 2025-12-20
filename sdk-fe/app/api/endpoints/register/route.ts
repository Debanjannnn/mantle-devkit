import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/endpoints/register
 * 
 * Register an endpoint when x402 middleware is first used
 * This allows endpoints to appear in the dashboard even before payments are made
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appId, endpoint, method, price, token, network } = body

    // Validate required fields
    if (!appId || !endpoint || !price || !token || !network) {
      return NextResponse.json(
        { error: 'Missing required fields: appId, endpoint, price, token, network' },
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

    // Check if endpoint already exists
    const existingEndpoint = await (prisma as any).endpoint.findUnique({
      where: {
        projectId_endpoint_method: {
          projectId: project.id,
          endpoint,
          method: method || null,
        },
      },
    })

    if (existingEndpoint) {
      // Update lastSeen and reactivate if it was deleted
      const updated = await (prisma as any).endpoint.update({
        where: { id: existingEndpoint.id },
        data: {
          lastSeen: new Date(),
          status: existingEndpoint.status === 'DELETED' ? 'ACTIVE' : existingEndpoint.status,
          price, // Update price in case it changed
          token, // Update token in case it changed
        },
      })

      return NextResponse.json(updated, { status: 200 })
    }

    // Create new endpoint
    const newEndpoint = await (prisma as any).endpoint.create({
      data: {
        projectId: project.id,
        endpoint,
        method: method || null,
        price,
        token,
        network,
        status: 'ACTIVE',
        lastSeen: new Date(),
      },
    })

    return NextResponse.json(newEndpoint, { status: 201 })
  } catch (error: any) {
    console.error('Error registering endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to register endpoint' },
      { status: 500 }
    )
  }
}

