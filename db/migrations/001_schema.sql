-- Mkulima Pro – PostgreSQL schema for AWS RDS
-- Run this against your RDS PostgreSQL instance (e.g. psql, AWS Query Editor).
-- Auth is handled by AWS Cognito; user_id = Cognito sub (UUID).

-- Profiles (Cognito user id = id, or app-issued uuid for RDS-only auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  role text,
  first_name text,
  last_name text,
  farm_size_hectares numeric DEFAULT NULL,
  county text DEFAULT NULL,
  phone text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Marketplace: product/input listings
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  price_kes numeric NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  category text NOT NULL,
  location text,
  location_county text,
  quantity_available numeric,
  is_verified_supplier boolean DEFAULT false,
  traceability_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- Loan products (admin-managed, read by all)
CREATE TABLE IF NOT EXISTS public.loan_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  max_amount_kes numeric NOT NULL,
  min_amount_kes numeric DEFAULT 0,
  interest_rate_pct numeric NOT NULL,
  tenure_months int NOT NULL,
  scale_type text DEFAULT 'all',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  loan_product_id uuid REFERENCES public.loan_products(id) ON DELETE SET NULL,
  amount_kes numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON public.loan_applications(user_id);

-- Logistics
CREATE TABLE IF NOT EXISTS public.logistics_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rating numeric DEFAULT 0,
  coverage_regions text[],
  cost_min_kes numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_description text NOT NULL,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  partner_id uuid REFERENCES public.logistics_partners(id) ON DELETE SET NULL,
  origin_location text,
  destination_county text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON public.shipments(user_id);

-- Groups and membership
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text,
  location text,
  county text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);

-- Advisory articles
CREATE TABLE IF NOT EXISTS public.advisory_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  content text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

-- Carbon / sustainability entries
CREATE TABLE IF NOT EXISTS public.carbon_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  co2_tons numeric NOT NULL DEFAULT 0,
  credits_earned numeric DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carbon_entries_user_id ON public.carbon_entries(user_id);

-- Seed loan products
INSERT INTO public.loan_products (name, max_amount_kes, min_amount_kes, interest_rate_pct, tenure_months, scale_type)
SELECT 'Seasonal Loan', 500000, 10000, 10, 12, 'smallholder'
WHERE NOT EXISTS (SELECT 1 FROM public.loan_products LIMIT 1);

INSERT INTO public.loan_products (name, max_amount_kes, min_amount_kes, interest_rate_pct, tenure_months, scale_type)
SELECT 'Equipment Loan', 2000000, 100000, 8, 36, 'commercial'
WHERE (SELECT COUNT(*) FROM public.loan_products) < 2;

INSERT INTO public.loan_products (name, max_amount_kes, min_amount_kes, interest_rate_pct, tenure_months, scale_type)
SELECT 'Land Development', 5000000, 500000, 7, 48, 'commercial'
WHERE (SELECT COUNT(*) FROM public.loan_products) < 3;

INSERT INTO public.loan_products (name, max_amount_kes, min_amount_kes, interest_rate_pct, tenure_months, scale_type)
SELECT 'Input Purchase', 200000, 5000, 12, 6, 'smallholder'
WHERE (SELECT COUNT(*) FROM public.loan_products) < 4;

-- Seed logistics partners
INSERT INTO public.logistics_partners (name, rating, coverage_regions, cost_min_kes)
SELECT 'Swift Logistics', 4.8, ARRAY['All regions'], 500
WHERE NOT EXISTS (SELECT 1 FROM public.logistics_partners LIMIT 1);

INSERT INTO public.logistics_partners (name, rating, coverage_regions, cost_min_kes)
SELECT 'Agri Transport', 4.6, ARRAY['Central', 'Eastern'], 600
WHERE (SELECT COUNT(*) FROM public.logistics_partners) < 2;

-- Seed advisory articles
INSERT INTO public.advisory_articles (title, category, content, language)
SELECT 'Best Practices for Maize Farming', 'Crop Management', 'Content on maize best practices...', 'en'
WHERE NOT EXISTS (SELECT 1 FROM public.advisory_articles LIMIT 1);

INSERT INTO public.advisory_articles (title, category, content, language)
SELECT 'Soil Health Management', 'Soil Management', 'Content on soil health...', 'en'
WHERE (SELECT COUNT(*) FROM public.advisory_articles) < 2;

INSERT INTO public.advisory_articles (title, category, content, language)
SELECT 'Pest Control Strategies', 'Pest Management', 'Content on pest control...', 'en'
WHERE (SELECT COUNT(*) FROM public.advisory_articles) < 3;
