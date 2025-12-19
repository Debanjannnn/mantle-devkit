import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[appId] - Get a specific project by appId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params

    const project = await prisma.project.findUnique({
      where: { appId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[appId] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params
    const body = await request.json()

    const { name, payTo, network, status } = body

    // Validate wallet address if provided
    if (payTo) {
      const walletRegex = /^0x[a-fA-F0-9]{40}$/
      if (!walletRegex.test(payTo)) {
        return NextResponse.json(
          { error: 'Invalid wallet address format' },
          { status: 400 }
        )
      }
    }

    // Build update data object
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (payTo !== undefined) updateData.payTo = payTo
    if (network !== undefined) updateData.network = network
    if (status !== undefined) updateData.status = status

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const project = await prisma.project.update({
      where: { appId },
      data: updateData,
    })

    return NextResponse.json(project)
  } catch (error: any) {
    console.error('Error updating project:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[appId] - Delete a project (soft delete by setting status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params

    // Soft delete by setting status to INACTIVE
    const project = await prisma.project.update({
      where: { appId },
      data: { status: 'INACTIVE' },
    })

    return NextResponse.json({ message: 'Project deleted', project })
  } catch (error: any) {
    console.error('Error deleting project:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}


