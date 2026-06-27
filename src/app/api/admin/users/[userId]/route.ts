import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

interface Params { params: Promise<{ userId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.systemRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (userId === session.userId) {
    return NextResponse.json({ error: 'Cannot change your own system role' }, { status: 400 })
  }

  const { systemRole } = await request.json()
  if (systemRole !== 'SUPER_ADMIN' && systemRole !== 'MEMBER') {
    return NextResponse.json({ error: 'Invalid systemRole' }, { status: 400 })
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { systemRole },
    select: { id: true, full_name: true, email: true, avatar_color: true, systemRole: true, created_at: true },
  })

  return NextResponse.json({ ...user, created_at: user.created_at.toISOString() })
}
