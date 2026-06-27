import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'

interface Params { params: Promise<{ taskId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { taskId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await db.task.findUnique({ where: { id: taskId }, select: { project_id: true } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, task.project_id)
  if (!can('edit_task', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { column, position } = await request.json()
  if (!column || position === undefined) {
    return NextResponse.json({ error: 'column and position required' }, { status: 400 })
  }

  const updated = await db.task.update({
    where: { id: taskId },
    data: { column, position },
  })

  return NextResponse.json({
    ...updated,
    due_date: updated.due_date ? updated.due_date.toISOString().split('T')[0] : null,
    created_at: updated.created_at.toISOString(),
    updated_at: updated.updated_at.toISOString(),
  })
}
