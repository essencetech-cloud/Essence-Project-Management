import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUserFromRequest } from '@/lib/auth-utils'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute  = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isApiRoute   = pathname.startsWith('/api')
  const isStatic     = pathname.startsWith('/_next') || pathname.startsWith('/favicon')
  const isAdminRoute = pathname.startsWith('/admin')

  if (isApiRoute || isStatic) return NextResponse.next()

  const user = await getSessionUserFromRequest(request)

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/projects'
    return NextResponse.redirect(url)
  }

  if (isAdminRoute && user?.systemRole !== 'SUPER_ADMIN') {
    const url = request.nextUrl.clone()
    url.pathname = '/projects'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
