import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.systemRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await db.user.findMany({
    select: { id: true, full_name: true, email: true, avatar_color: true, systemRole: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })

  return NextResponse.json(users.map((u: (typeof users)[number]) => ({ ...u, created_at: u.created_at.toISOString() })))
}
