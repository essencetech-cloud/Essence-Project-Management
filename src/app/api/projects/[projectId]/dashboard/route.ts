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

  const [
    totalTasks,
    doneTasks,
    archivedTasks,
    totalDocs,
    memberCount,
    myTasks,
    recentActivity,
    tasksByColumn,
    overdueTasks,
  ] = await Promise.all([
    db.task.count({ where: { project_id: projectId, archived_at: null } }),
    db.task.count({ where: { project_id: projectId, column: 'done', archived_at: null } }),
    db.task.count({ where: { project_id: projectId, archived_at: { not: null } } }),
    db.doc.count({ where: { project_id: projectId } }),
    db.projectMember.count({ where: { project_id: projectId } }),
    db.task.findMany({
      where: {
        project_id: projectId,
        assignee_id: session.userId,
        archived_at: null,
        column: { not: 'done' },
      },
      orderBy: [{ due_date: 'asc' }, { created_at: 'desc' }],
      take: 5,
      select: { id: true, title: true, column: true, priority: true, tag: true, due_date: true },
    }),
    db.activityLog.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: { user: { select: { id: true, full_name: true, avatar_color: true } } },
    }),
    db.task.groupBy({
      by: ['column'],
      where: { project_id: projectId, archived_at: null },
      _count: { _all: true },
    }),
    db.task.count({
      where: {
        project_id: projectId,
        archived_at: null,
        column: { not: 'done' },
        due_date: { lt: new Date() },
      },
    }),
  ])

  const columnCounts = Object.fromEntries(
    tasksByColumn.map((r: (typeof tasksByColumn)[number]) => [r.column, r._count._all])
  )

  return NextResponse.json({
    stats: {
      totalTasks,
      doneTasks,
      archivedTasks,
      totalDocs,
      memberCount,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    },
    columnCounts,
    myTasks: myTasks.map((t: (typeof myTasks)[number]) => ({
      ...t,
      due_date: t.due_date ? t.due_date.toISOString().split('T')[0] : null,
    })),
    recentActivity: recentActivity.map((a: (typeof recentActivity)[number]) => ({
      ...a,
      created_at: a.created_at.toISOString(),
    })),
  })
}
