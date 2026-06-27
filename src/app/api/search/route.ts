import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ tasks: [], docs: [], projects: [] })

  const memberProjectIds = await db.projectMember
    .findMany({ where: { user_id: session.userId }, select: { project_id: true } })
    .then((rows) => rows.map((r: { project_id: string }) => r.project_id))

  const isSuperAdmin = session.systemRole === 'SUPER_ADMIN'
  const projectFilter = isSuperAdmin ? {} : { id: { in: memberProjectIds } }

  const [tasks, docs, projects] = await Promise.all([
    db.task.findMany({
      where: {
        archived_at: null,
        project: projectFilter,
        OR: [
          { title:       { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true, title: true, column: true, priority: true, tag: true, project_id: true,
        project: { select: { id: true, name: true, color: true } },
      },
      take: 8,
    }),
    db.doc.findMany({
      where: {
        project: projectFilter,
        title: { contains: q, mode: 'insensitive' },
      },
      select: {
        id: true, title: true, project_id: true,
        project: { select: { id: true, name: true, color: true } },
      },
      take: 8,
    }),
    db.project.findMany({
      where: {
        ...projectFilter,
        name: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, name: true, color: true },
      take: 5,
    }),
  ])

  return NextResponse.json({ tasks, docs, projects })
}
