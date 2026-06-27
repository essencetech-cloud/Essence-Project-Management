import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'

interface Params { params: Promise<{ projectId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('view_project', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...project,
    created_at: project.created_at.toISOString(),
    updated_at: project.updated_at.toISOString(),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('edit_project', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, description, color } = await request.json()
  const project = await db.project.update({
    where: { id: projectId },
    data: { name, description, color },
  })

  return NextResponse.json({
    ...project,
    created_at: project.created_at.toISOString(),
    updated_at: project.updated_at.toISOString(),
  })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('delete_project', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.project.delete({ where: { id: projectId } })
  return new NextResponse(null, { status: 204 })
}
