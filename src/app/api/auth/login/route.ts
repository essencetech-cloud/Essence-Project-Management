import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken, makeAuthCookie } from '@/lib/auth-utils'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await signToken({ userId: user.id, email: user.email, systemRole: user.systemRole })
  const response = NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    systemRole: user.systemRole,
  })
  response.cookies.set(makeAuthCookie(token))
  return response
}
