'use server'

import { redirect } from 'next/navigation'
import { hash, compare } from 'bcryptjs'
import { getPool } from '@/lib/db/pool'
import { setAuthCookie } from '@/lib/auth/cookie'
import { createSession } from '@/lib/auth/session'

export async function login(email: string, password: string) {
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, role, first_name, last_name FROM profiles WHERE email = $1',
    [email.trim().toLowerCase()]
  )
  const profile = rows[0]
  if (!profile?.password_hash) throw new Error('Invalid email or password')
  const ok = await compare(password, profile.password_hash)
  if (!ok) throw new Error('Invalid email or password')
  const token = await createSession({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    first_name: profile.first_name,
    last_name: profile.last_name,
  })
  await setAuthCookie(token)
  redirect('/protected')
}

export async function signup(form: {
  email: string
  password: string
  first_name: string
  last_name: string
  role: string
}) {
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  const email = form.email.trim().toLowerCase()
  const { rowCount } = await pool.query('SELECT 1 FROM profiles WHERE email = $1', [email])
  if (rowCount && rowCount > 0) throw new Error('An account with this email already exists')
  const passwordHash = await hash(form.password, 10)
  const { rows } = await pool.query(
    `INSERT INTO profiles (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role, first_name, last_name`,
    [email, passwordHash, form.first_name.trim(), form.last_name.trim(), form.role]
  )
  const profile = rows[0]
  if (!profile) throw new Error('Sign up failed')
  const token = await createSession({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    first_name: profile.first_name,
    last_name: profile.last_name,
  })
  await setAuthCookie(token)
  redirect('/auth/signup-success')
}
