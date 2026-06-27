import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where = session.systemRole === 'SUPER_ADMIN'
    ? {}
    : { members: { some: { user_id: session.userId } } }

  const projects = await db.project.findMany({
    where,
    include: { _count: { select: { members: true, tasks: true } } },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json(
    projects.map((p) => ({
      ...p,
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
      member_count: p._count.members,
      task_count: p._count.tasks,
    }))
  )
}

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, color } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const project = await db.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      color: color ?? 'indigo',
      created_by: session.userId,
      members: { create: { user_id: session.userId, role: 'OWNER' } },
    },
  })

  return NextResponse.json({
    ...project,
    created_at: project.created_at.toISOString(),
    updated_at: project.updated_at.toISOString(),
    member_count: 1,
    task_count: 0,
  }, { status: 201 })
}
