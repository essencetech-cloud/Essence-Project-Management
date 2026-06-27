import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.systemRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [users, projects, tasks, docs] = await Promise.all([
    db.user.count(),
    db.project.count(),
    db.task.count(),
    db.doc.count(),
  ])

  return NextResponse.json({ users, projects, tasks, docs })
}
