import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/v1/validate?appId=xxx
 * 
 * Platform validation endpoint for server SDK
 * Called by @x402-devkit/server to validate project configuration
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('appId')

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      )
    }

    // Get project by appId
    const project = await prisma.project.findUnique({
      where: { appId },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if project is active
    if (project.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Project is not active: status is ${project.status}` },
        { status: 403 }
      )
    }

    // Return project config (what SDK needs)
    return NextResponse.json({
      appId: project.appId,
      name: project.name,
      payTo: project.payTo,
      network: project.network,
      status: project.status,
    })
  } catch (error) {
    console.error('Error validating project:', error)
    return NextResponse.json(
      { error: 'Failed to validate project' },
      { status: 500 }
    )
  }
}

