import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { getPool } from '@/lib/db/pool'
import { createSession } from '@/lib/auth/session'

const COOKIE_NAME = 'mkulima-auth'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    const pool = getPool()
    if (!pool) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role, first_name, last_name FROM profiles WHERE email = $1',
      [String(email).trim().toLowerCase()]
    )
    const profile = rows[0]
    if (!profile?.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    const ok = await compare(String(password), profile.password_hash)
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    const token = await createSession({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      first_name: profile.first_name,
      last_name: profile.last_name,
    })
    const res = NextResponse.json({ redirect: '/protected' })
    res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
