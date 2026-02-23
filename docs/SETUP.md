# Mkulima Pro – Setup

The app uses **Node.js** on the backend (Next.js server, API routes, server actions), **PostgreSQL** (e.g. AWS RDS) for data, and **JWT sessions** (cookie) for auth.

## 1. Environment

Copy `.env.example` to `.env.local` and set:

- **`DATABASE_URL`** – Postgres connection string (e.g. RDS):  
  `postgresql://USER:PASSWORD@your-rds-endpoint:5432/postgres`
- **`JWT_SECRET`** – A long random string used to sign session JWTs (e.g. 32+ chars). Use a strong secret in production.

## 2. Database (PostgreSQL / RDS)

1. Create a PostgreSQL database (e.g. [Amazon RDS](https://aws.amazon.com/rds/)).
2. Run the migration in this repo:
   - Open **`db/migrations/001_schema.sql`**.
   - Execute it against your database (psql, AWS RDS Query Editor, or any Postgres client).

This creates:

- **profiles** – users (email, password_hash, role, first_name, last_name, etc.)
- **listings** – marketplace
- **loan_products** + **loan_applications** – finance
- **logistics_partners** + **shipments** – logistics
- **groups** + **group_members** – groups & SACCOs
- **advisory_articles** – advisory content
- **carbon_entries** – sustainability

Seed data for loan products, logistics partners, and advisory articles is included.

## 3. PWA

- **Manifest:** `public/manifest.json`
- **Service worker:** `public/sw.js` (registered by `components/pwa-register.tsx`)

## 4. Weather

Uses the free [Open-Meteo](https://open-meteo.com) API (no key). Default location is Nairobi (`lib/weather.ts`).

## 5. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up and log in with email/password; sessions are stored in an HTTP-only cookie (JWT).
