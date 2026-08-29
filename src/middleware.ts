import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/adminAuth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const authed = await verifySessionToken(token)

  if (pathname === '/admin/login') {
    if (authed) return NextResponse.redirect(new URL('/admin', req.url))
    return NextResponse.next()
  }

  if (!authed) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
