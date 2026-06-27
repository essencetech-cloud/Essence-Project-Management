import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import { logActivity } from '@/lib/logActivity'
import { createNotification } from '@/lib/createNotification'

interface Params { params: Promise<{ taskId: string }> }

const USER_SELECT = { id: true, full_name: true, email: true, avatar_color: true, systemRole: true, created_at: true }

export async function PATCH(request: Request, { params }: Params) {
  const { taskId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await db.task.findUnique({ where: { id: taskId }, select: { project_id: true, title: true, assignee_id: true } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, task.project_id)
  if (!can('edit_task', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, description, tag, priority, assignee_id, due_date } = await request.json()

  const updated = await db.task.update({
    where: { id: taskId },
    data: {
      ...(title !== undefined       && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(tag !== undefined         && { tag }),
      ...(priority !== undefined    && { priority }),
      ...(assignee_id !== undefined && { assignee_id: assignee_id || null }),
      ...(due_date !== undefined    && { due_date: due_date ? new Date(due_date) : null }),
    },
    include: { assignee: { select: USER_SELECT }, creator: { select: USER_SELECT } },
  })

  logActivity({
    project_id: task.project_id,
    user_id: session.userId,
    action: 'task.updated',
    entity_type: 'task',
    entity_id: taskId,
    entity_name: updated.title,
  })

  const newAssignee = assignee_id !== undefined ? assignee_id : task.assignee_id
  if (newAssignee && newAssignee !== task.assignee_id && newAssignee !== session.userId) {
    const editor = await db.user.findUnique({ where: { id: session.userId }, select: { full_name: true } })
    createNotification({
      user_id: newAssignee,
      type: 'task.assigned',
      title: `${editor?.full_name ?? 'Someone'} assigned you "${updated.title}"`,
      link: `/projects/${task.project_id}/tasks`,
    })
  }

  return NextResponse.json({
    ...updated,
    due_date: updated.due_date ? updated.due_date.toISOString().split('T')[0] : null,
    archived_at: updated.archived_at ? updated.archived_at.toISOString() : null,
    created_at: updated.created_at.toISOString(),
    updated_at: updated.updated_at.toISOString(),
    assignee: updated.assignee ? { ...updated.assignee, created_at: updated.assignee.created_at.toISOString() } : null,
    creator:  { ...updated.creator, created_at: updated.creator.created_at.toISOString() },
  })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { taskId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await db.task.findUnique({ where: { id: taskId }, select: { project_id: true, title: true } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, task.project_id)
  if (!can('delete_task', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.task.delete({ where: { id: taskId } })

  logActivity({
    project_id: task.project_id,
    user_id: session.userId,
    action: 'task.deleted',
    entity_type: 'task',
    entity_id: taskId,
    entity_name: task.title,
  })

  return new NextResponse(null, { status: 204 })
}
