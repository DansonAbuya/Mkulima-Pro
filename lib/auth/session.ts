import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'

const COOKIE_NAME = 'mkulima-auth'
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface AuthUser {
  id: string
  email: string
  role?: string
  first_name?: string
  last_name?: string
}

export async function getSession(): Promise<{ user: AuthUser } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    const sub = payload.sub
    if (!sub) return null
    return {
      user: {
        id: sub,
        email: (payload.email as string) ?? '',
        role: (payload.role as string) ?? (payload['custom:role'] as string),
        first_name: (payload.first_name as string) ?? (payload['custom:first_name'] as string) ?? (payload.given_name as string),
        last_name: (payload.last_name as string) ?? (payload['custom:last_name'] as string) ?? (payload.family_name as string),
      },
    }
  } catch {
    return null
  }
}

export async function createSession(user: AuthUser): Promise<string> {
  const token = await new SignJWT({
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
  })
    .setSubject(user.id)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  return token
}

export function getAuthCookieName(): string {
  return COOKIE_NAME
}
