import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import { logActivity } from '@/lib/logActivity'

interface Params { params: Promise<{ taskId: string }> }

export async function PATCH(_req: Request, { params }: Params) {
  const { taskId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await db.task.findUnique({ where: { id: taskId }, select: { project_id: true, title: true } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, task.project_id)
  if (!can('edit_task', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await db.task.update({
    where: { id: taskId },
    data: { archived_at: null, archived_by: null },
  })

  logActivity({
    project_id: task.project_id,
    user_id: session.userId,
    action: 'task.unarchived',
    entity_type: 'task',
    entity_id: taskId,
    entity_name: task.title,
  })

  return NextResponse.json({
    ...updated,
    due_date: updated.due_date ? updated.due_date.toISOString().split('T')[0] : null,
    archived_at: null,
    created_at: updated.created_at.toISOString(),
    updated_at: updated.updated_at.toISOString(),
  })
}
