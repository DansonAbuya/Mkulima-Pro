-- Carbon credits and sustainability tracking
create table if not exists public.sustainability_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text check (activity_type in ('agroforestry', 'conservation_agriculture', 'soil_protection', 'renewable_energy', 'water_harvesting', 'crop_rotation', 'organic_farming')),
  description text not null,
  area_hectares decimal(10, 2),
  carbon_sequestered_tons decimal(10, 2),
  estimated_credits integer,
  implementation_date date,
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verified_by uuid references public.profiles(id),
  verification_date date,
  documentation_url text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.sustainability_activities enable row level security;

create policy "sustainability_activities_select_own" on public.sustainability_activities for select using (auth.uid() = user_id);
create policy "sustainability_activities_select_admin" on public.sustainability_activities for select using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);
create policy "sustainability_activities_insert_own" on public.sustainability_activities for insert with check (auth.uid() = user_id);
create policy "sustainability_activities_update_own" on public.sustainability_activities for update using (auth.uid() = user_id);

-- Carbon credits wallet
create table if not exists public.carbon_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  total_credits integer default 0,
  earned_credits integer default 0,
  sold_credits integer default 0,
  pending_verification integer default 0,
  last_updated timestamp with time zone default now()
);

alter table public.carbon_credits enable row level security;

create policy "carbon_credits_select_own" on public.carbon_credits for select using (auth.uid() = user_id);

-- Carbon credit transactions (buying/selling)
create table if not exists public.carbon_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  transaction_type text check (transaction_type in ('earn', 'sell', 'redeem')),
  amount integer not null,
  price_per_credit decimal(8, 2),
  total_value decimal(12, 2),
  buyer_id uuid references public.profiles(id),
  transaction_date timestamp with time zone default now(),
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.carbon_credit_transactions enable row level security;

create policy "carbon_credit_transactions_select_own" on public.carbon_credit_transactions for select using (
  auth.uid() = user_id or auth.uid() = buyer_id
);
create policy "carbon_credit_transactions_insert_own" on public.carbon_credit_transactions for insert with check (auth.uid() = user_id);
