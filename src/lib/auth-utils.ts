import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import type { SystemRole } from '@prisma/client'

const COOKIE = 'essence_token'
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret')

export interface JWTPayload {
  userId: string
  email: string
  systemRole: SystemRole
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    const raw = payload as unknown as Record<string, unknown>
    return {
      userId: raw['userId'] as string,
      email: raw['email'] as string,
      systemRole: (raw['systemRole'] as SystemRole) ?? 'MEMBER',
    }
  } catch {
    return null
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export function getSessionUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE)?.value
  if (!token) return Promise.resolve(null)
  return verifyToken(token)
}

export function makeAuthCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }
}
