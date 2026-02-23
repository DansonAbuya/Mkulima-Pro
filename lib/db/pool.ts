import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database features will not work.')
}

const pool = connectionString
  ? new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : null

export function getPool(): Pool | null {
  return pool
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const p = getPool()
  if (!p) throw new Error('Database not configured (DATABASE_URL missing)')
  const result = await p.query(text, params)
  return { rows: (result.rows as T[]) ?? [], rowCount: result.rowCount ?? 0 }
}
