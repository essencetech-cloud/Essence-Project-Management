import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.systemRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const projects = await db.project.findMany({
    include: {
      creator: { select: { id: true, full_name: true, email: true } },
      _count: { select: { members: true, tasks: true } },
    },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json(projects.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    created_at: p.created_at.toISOString(),
    owner: p.creator,
    member_count: p._count.members,
    task_count: p._count.tasks,
  })))
}
