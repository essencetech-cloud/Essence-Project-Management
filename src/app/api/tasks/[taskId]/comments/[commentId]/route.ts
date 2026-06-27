import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

interface Params { params: Promise<{ taskId: string; commentId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { commentId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const comment = await db.comment.findUnique({ where: { id: commentId } })
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (comment.user_id !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { body } = await request.json()
  if (!body?.trim()) return NextResponse.json({ error: 'Body required' }, { status: 400 })

  const updated = await db.comment.update({
    where: { id: commentId },
    data: { body: body.trim() },
    include: {
      user: { select: { id: true, full_name: true, email: true, avatar_color: true } },
    },
  })

  return NextResponse.json({
    ...updated,
    created_at: updated.created_at.toISOString(),
    updated_at: updated.updated_at.toISOString(),
  })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { commentId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { task: { select: { project_id: true } } },
  })
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isSelf = comment.user_id === session.userId
  if (!isSelf) {
    const { getProjectRole } = await import('@/lib/getProjectRole')
    const { can } = await import('@/lib/permissions')
    const { projectRole, systemRole } = await getProjectRole(session.userId, comment.task.project_id)
    if (!can('edit_task', projectRole, systemRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  await db.comment.delete({ where: { id: commentId } })
  return new NextResponse(null, { status: 204 })
}
