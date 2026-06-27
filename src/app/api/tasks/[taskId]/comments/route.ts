import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import { createNotification } from '@/lib/createNotification'

interface Params { params: Promise<{ taskId: string }> }

const USER_SELECT = { id: true, full_name: true, email: true, avatar_color: true }

function serializeComment(c: {
  id: string; task_id: string; user_id: string; body: string
  created_at: Date; updated_at: Date
  user: { id: string; full_name: string; email: string; avatar_color: string }
}) {
  return { ...c, created_at: c.created_at.toISOString(), updated_at: c.updated_at.toISOString() }
}

export async function GET(_req: Request, { params }: Params) {
  const { taskId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await db.task.findUnique({ where: { id: taskId }, select: { project_id: true } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, task.project_id)
  if (!can('view_tasks', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const comments = await db.comment.findMany({
    where: { task_id: taskId },
    orderBy: { created_at: 'asc' },
    include: { user: { select: USER_SELECT } },
  })

  return NextResponse.json(comments.map(serializeComment))
}

export async function POST(request: Request, { params }: Params) {
  const { taskId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { project_id: true, title: true, assignee_id: true, created_by: true },
  })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, task.project_id)
  if (!can('view_tasks', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { body } = await request.json()
  if (!body?.trim()) return NextResponse.json({ error: 'Body required' }, { status: 400 })

  const comment = await db.comment.create({
    data: { task_id: taskId, user_id: session.userId, body: body.trim() },
    include: { user: { select: USER_SELECT } },
  })

  const commenter = await db.user.findUnique({
    where: { id: session.userId },
    select: { full_name: true },
  })

  const notifyIds = Array.from(
    new Set([task.assignee_id, task.created_by].filter((id): id is string => !!id && id !== session.userId))
  )

  for (const uid of notifyIds) {
    createNotification({
      user_id: uid,
      type: 'comment.added',
      title: `${commenter?.full_name ?? 'Someone'} commented on "${task.title}"`,
      body: body.trim().slice(0, 120),
      link: `/projects/${task.project_id}/tasks`,
    })
  }

  return NextResponse.json(serializeComment(comment), { status: 201 })
}
