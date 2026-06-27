import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import { logActivity } from '@/lib/logActivity'
import { createNotification } from '@/lib/createNotification'

const USER_SELECT = { id: true, full_name: true, email: true, avatar_color: true, systemRole: true, created_at: true }

function serializeTask(t: {
  id: string; project_id: string; title: string; description: string | null
  column: string; tag: string; priority: string; position: number
  assignee_id: string | null; created_by: string; due_date: Date | null
  archived_at: Date | null; archived_by: string | null
  created_at: Date; updated_at: Date
  assignee: { id: string; full_name: string; email: string; avatar_color: string; systemRole: string; created_at: Date } | null
  creator:  { id: string; full_name: string; email: string; avatar_color: string; systemRole: string; created_at: Date }
}) {
  return {
    ...t,
    due_date: t.due_date ? t.due_date.toISOString().split('T')[0] : null,
    archived_at: t.archived_at ? t.archived_at.toISOString() : null,
    created_at: t.created_at.toISOString(),
    updated_at: t.updated_at.toISOString(),
    assignee: t.assignee ? { ...t.assignee, created_at: t.assignee.created_at.toISOString() } : null,
    creator:  { ...t.creator,  created_at: t.creator.created_at.toISOString() },
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const includeArchived = searchParams.get('includeArchived') === 'true'
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('view_tasks', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const tasks = await db.task.findMany({
    where: {
      project_id: projectId,
      archived_at: includeArchived ? undefined : null,
    },
    include: { assignee: { select: USER_SELECT }, creator: { select: USER_SELECT } },
    orderBy: [{ column: 'asc' }, { position: 'asc' }],
  })

  return NextResponse.json(tasks.map(serializeTask))
}

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { project_id, title, description, column, tag, priority, assignee_id, due_date } = await request.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, project_id)
  if (!can('create_task', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const last = await db.task.findFirst({
    where: { project_id, column: column ?? 'todo' },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  const position = (last?.position ?? 0) + 1

  const task = await db.task.create({
    data: {
      project_id, title: title.trim(),
      description: description?.trim() || null,
      column: column ?? 'todo', tag: tag ?? 'feature',
      priority: priority ?? 'medium', position,
      assignee_id: assignee_id || null,
      created_by: session.userId,
      due_date: due_date ? new Date(due_date) : null,
    },
    include: { assignee: { select: USER_SELECT }, creator: { select: USER_SELECT } },
  })

  logActivity({
    project_id,
    user_id: session.userId,
    action: 'task.created',
    entity_type: 'task',
    entity_id: task.id,
    entity_name: task.title,
  })

  if (assignee_id && assignee_id !== session.userId) {
    const creator = await db.user.findUnique({ where: { id: session.userId }, select: { full_name: true } })
    createNotification({
      user_id: assignee_id,
      type: 'task.assigned',
      title: `${creator?.full_name ?? 'Someone'} assigned you "${task.title}"`,
      link: `/projects/${project_id}/tasks`,
    })
  }

  return NextResponse.json(serializeTask(task), { status: 201 })
}
