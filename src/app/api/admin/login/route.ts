import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { ADMIN_SESSION_COOKIE, createSessionToken } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const validEmail = process.env.ADMIN_LOGIN_EMAIL || ''
  const passwordHashB64 = process.env.ADMIN_LOGIN_PASSWORD_HASH_B64 || ''
  const passwordHash = passwordHashB64 ? Buffer.from(passwordHashB64, 'base64').toString('utf8') : ''

  const emailMatches = typeof email === 'string' && email.trim().toLowerCase() === validEmail.toLowerCase()
  const passwordMatches =
    typeof password === 'string' && !!passwordHash && (await bcrypt.compare(password, passwordHash).catch(() => false))

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await createSessionToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}
