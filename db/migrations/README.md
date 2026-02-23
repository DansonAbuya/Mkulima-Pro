# Database migrations (AWS RDS PostgreSQL)

The app backend is **Node.js** (Next.js). Run the SQL in `001_schema.sql` against your RDS PostgreSQL database (e.g. using psql, AWS RDS Query Editor, or any Postgres client).

This creates all tables and seed data. Auth uses the `profiles` table (email + password_hash) and JWT sessions; no Supabase.
