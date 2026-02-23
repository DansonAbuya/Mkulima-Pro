import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database features will not work.')
}

// Use SSL for non-localhost connections (required by RDS and most cloud Postgres; avoids "no pg_hba.conf entry, no encryption")
const isLocal =
  !connectionString ||
  /localhost|127\.0\.0\.1|\.local\b/i.test(connectionString)
const pool = connectionString
  ? new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isLocal
        ? false
        : { rejectUnauthorized: false }, // RDS and cloud Postgres typically require SSL
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
