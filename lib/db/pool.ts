import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database features will not work.')
}

// Use SSL for non-localhost connections (required by RDS and most cloud Postgres; avoids "no pg_hba.conf entry, no encryption")
const isLocal =
  !connectionString ||
  /localhost|127\.0\.0\.1|\.local\b/i.test(connectionString)

// For remote DBs: accept self-signed / RDS certs to avoid "self-signed certificate in certificate chain" (SELF_SIGNED_CERT_IN_CHAIN)
const sslConfig = isLocal
  ? false
  : { rejectUnauthorized: false }

// Ensure Node's TLS doesn't reject RDS/cloud self-signed certs (some runtimes ignore pg's ssl.rejectUnauthorized)
if (connectionString && !isLocal) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const pool = connectionString
  ? new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: sslConfig,
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
