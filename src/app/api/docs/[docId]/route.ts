import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import { logActivity } from '@/lib/logActivity'

interface Params { params: Promise<{ docId: string }> }

const USER_SELECT = { id: true, full_name: true, email: true, avatar_color: true, systemRole: true, created_at: true }

function serializeDoc(d: {
  id: string; project_id: string; title: string; content: unknown; created_by: string; updated_by: string | null
  created_at: Date; updated_at: Date
  creator: { id: string; full_name: string; email: string; avatar_color: string; systemRole: string; created_at: Date }
  editor:  { id: string; full_name: string; email: string; avatar_color: string; systemRole: string; created_at: Date } | null
}) {
  return {
    ...d,
    created_at: d.created_at.toISOString(),
    updated_at: d.updated_at.toISOString(),
    creator: { ...d.creator, created_at: d.creator.created_at.toISOString() },
    editor:  d.editor ? { ...d.editor, created_at: d.editor.created_at.toISOString() } : null,
  }
}

export async function GET(_req: Request, { params }: Params) {
  const { docId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await db.doc.findUnique({
    where: { id: docId },
    include: { creator: { select: USER_SELECT }, editor: { select: USER_SELECT } },
  })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, doc.project_id)
  if (!can('view_docs', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(serializeDoc(doc))
}

export async function PATCH(request: Request, { params }: Params) {
  const { docId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await db.doc.findUnique({ where: { id: docId }, select: { project_id: true, title: true } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, doc.project_id)
  if (!can('edit_doc', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, content } = await request.json()

  const updated = await db.doc.update({
    where: { id: docId },
    data: {
      ...(title   !== undefined && { title }),
      ...(content !== undefined && { content }),
      updated_by: session.userId,
    },
    include: { creator: { select: USER_SELECT }, editor: { select: USER_SELECT } },
  })

  logActivity({
    project_id: doc.project_id,
    user_id: session.userId,
    action: 'doc.updated',
    entity_type: 'doc',
    entity_id: docId,
    entity_name: updated.title,
  })

  return NextResponse.json(serializeDoc(updated))
}

export async function DELETE(_req: Request, { params }: Params) {
  const { docId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await db.doc.findUnique({ where: { id: docId }, select: { project_id: true, title: true } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, doc.project_id)
  if (!can('delete_doc', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.doc.delete({ where: { id: docId } })

  logActivity({
    project_id: doc.project_id,
    user_id: session.userId,
    action: 'doc.deleted',
    entity_type: 'doc',
    entity_id: docId,
    entity_name: doc.title,
  })

  return new NextResponse(null, { status: 204 })
}
