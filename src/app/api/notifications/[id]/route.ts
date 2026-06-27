import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(_req: Request, { params }: Params) {
  const { id } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notif = await db.notification.findUnique({ where: { id } })
  if (!notif || notif.user_id !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await db.notification.update({ where: { id }, data: { read: true } })
  return NextResponse.json({ ...updated, created_at: updated.created_at.toISOString() })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notif = await db.notification.findUnique({ where: { id } })
  if (!notif || notif.user_id !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.notification.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
