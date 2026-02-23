import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
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
    const { email, password, first_name, last_name, role } = body
    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json(
        { error: 'Email, password, first name, last name, and role are required' },
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
    const emailNorm = String(email).trim().toLowerCase()
    const { rowCount } = await pool.query('SELECT 1 FROM profiles WHERE email = $1', [emailNorm])
    if (rowCount && rowCount > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }
    const passwordHash = await hash(String(password), 10)
    const { rows } = await pool.query(
      `INSERT INTO profiles (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, first_name, last_name`,
      [
        emailNorm,
        passwordHash,
        String(first_name).trim(),
        String(last_name).trim(),
        String(role),
      ]
    )
    const profile = rows[0]
    if (!profile) {
      return NextResponse.json({ error: 'Sign up failed' }, { status: 500 })
    }
    const token = await createSession({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      first_name: profile.first_name,
      last_name: profile.last_name,
    })
    const res = NextResponse.json({ redirect: '/auth/signup-success' })
    res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
    return res
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
