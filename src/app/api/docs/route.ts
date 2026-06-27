import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import { logActivity } from '@/lib/logActivity'

const USER_SELECT = { id: true, full_name: true, email: true, avatar_color: true, systemRole: true, created_at: true }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('view_docs', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const docs = await db.doc.findMany({
    where: { project_id: projectId },
    select: {
      id: true, project_id: true, title: true, created_by: true, updated_by: true,
      created_at: true, updated_at: true, creator: { select: USER_SELECT },
    },
    orderBy: { updated_at: 'desc' },
  })

  return NextResponse.json(docs.map((d) => ({
    ...d,
    created_at: d.created_at.toISOString(),
    updated_at: d.updated_at.toISOString(),
    creator: d.creator ? { ...d.creator, created_at: d.creator.created_at.toISOString() } : null,
  })))
}

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { project_id, title } = await request.json()

  const { projectRole, systemRole } = await getProjectRole(session.userId, project_id)
  if (!can('create_doc', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const doc = await db.doc.create({
    data: { project_id, title: title?.trim() || 'Untitled', created_by: session.userId, updated_by: session.userId },
    include: { creator: { select: USER_SELECT } },
  })

  logActivity({
    project_id,
    user_id: session.userId,
    action: 'doc.created',
    entity_type: 'doc',
    entity_id: doc.id,
    entity_name: doc.title,
  })

  return NextResponse.json({
    ...doc,
    created_at: doc.created_at.toISOString(),
    updated_at: doc.updated_at.toISOString(),
    creator: doc.creator ? { ...doc.creator, created_at: doc.creator.created_at.toISOString() } : null,
  }, { status: 201 })
}
