import { cookies } from 'next/headers'

const COOKIE_NAME = 'mkulima-auth'

export async function setAuthCookie(idToken: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
