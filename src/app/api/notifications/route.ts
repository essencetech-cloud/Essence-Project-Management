import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unreadOnly') === 'true'

  const notifications = await db.notification.findMany({
    where: {
      user_id: session.userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { created_at: 'desc' },
    take: 50,
  })

  return NextResponse.json(
    notifications.map((n: (typeof notifications)[number]) => ({ ...n, created_at: n.created_at.toISOString() }))
  )
}
