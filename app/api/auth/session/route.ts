import { NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth/cookie'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const idToken = body?.idToken ?? body?.id_token
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 })
    }
    await setAuthCookie(idToken)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 })
  }
}
