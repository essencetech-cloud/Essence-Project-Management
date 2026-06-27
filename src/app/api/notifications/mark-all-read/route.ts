import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

export async function PATCH() {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.notification.updateMany({
    where: { user_id: session.userId, read: false },
    data: { read: true },
  })

  return NextResponse.json({ ok: true })
}
