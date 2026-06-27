import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken, makeAuthCookie } from '@/lib/auth-utils'
import { AVATAR_COLORS } from '@/lib/constants'

export async function POST(request: Request) {
  const { email, password, full_name } = await request.json()

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const exists = await db.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 10)
  const avatar_color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

  const userCount = await db.user.count()
  const systemRole = userCount === 0 ? 'SUPER_ADMIN' : 'MEMBER'

  const user = await db.user.create({
    data: { email, full_name, password_hash, avatar_color, systemRole },
  })

  const token = await signToken({ userId: user.id, email: user.email, systemRole: user.systemRole })
  const response = NextResponse.json(
    { id: user.id, email: user.email, full_name: user.full_name, systemRole: user.systemRole },
    { status: 201 }
  )
  response.cookies.set(makeAuthCookie(token))
  return response
}
