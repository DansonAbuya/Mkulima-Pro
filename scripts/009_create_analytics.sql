-- Farm production analytics
create table if not exists public.farm_production (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  crop_name text not null,
  planting_date date,
  harvest_date date,
  area_planted_hectares decimal(10, 2),
  quantity_harvested decimal(12, 2),
  unit text,
  yield_per_hectare decimal(10, 2),
  cost_of_production decimal(12, 2),
  revenue_from_sale decimal(12, 2),
  net_profit decimal(12, 2),
  quality_grade text,
  market_price_per_unit decimal(10, 2),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.farm_production enable row level security;

create policy "farm_production_select_own" on public.farm_production for select using (auth.uid() = user_id);
create policy "farm_production_insert_own" on public.farm_production for insert with check (auth.uid() = user_id);
create policy "farm_production_update_own" on public.farm_production for update using (auth.uid() = user_id);
create policy "farm_production_delete_own" on public.farm_production for delete using (auth.uid() = user_id);

-- Farm expense tracking
create table if not exists public.farm_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expense_category text check (expense_category in ('seeds', 'fertilizer', 'pesticides', 'labor', 'water', 'equipment', 'transport', 'storage', 'other')),
  amount decimal(12, 2) not null,
  currency text default 'KES',
  description text,
  expense_date date,
  crop_name text,
  created_at timestamp with time zone default now()
);

alter table public.farm_expenses enable row level security;

create policy "farm_expenses_select_own" on public.farm_expenses for select using (auth.uid() = user_id);
create policy "farm_expenses_insert_own" on public.farm_expenses for insert with check (auth.uid() = user_id);
create policy "farm_expenses_update_own" on public.farm_expenses for update using (auth.uid() = user_id);
create policy "farm_expenses_delete_own" on public.farm_expenses for delete using (auth.uid() = user_id);

-- Yield and production analytics summary
create table if not exists public.farm_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  total_area_cultivated_hectares decimal(10, 2) default 0,
  total_yield_last_season decimal(12, 2) default 0,
  average_yield_per_hectare decimal(10, 2) default 0,
  total_revenue_last_year decimal(12, 2) default 0,
  total_expenses_last_year decimal(12, 2) default 0,
  net_profit_last_year decimal(12, 2) default 0,
  profitability_ratio decimal(5, 2) default 0,
  main_crops text[] default '{}',
  last_updated timestamp with time zone default now()
);

alter table public.farm_analytics enable row level security;

create policy "farm_analytics_select_own" on public.farm_analytics for select using (auth.uid() = user_id);

-- Create indexes for better query performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_farmer_type on public.profiles(farmer_type);
create index if not exists idx_profiles_location on public.profiles using gist(ll_to_earth(latitude, longitude));
create index if not exists idx_advisories_category on public.advisories(category);
create index if not exists idx_advisories_created_by on public.advisories(created_by);
create index if not exists idx_loans_user_id on public.loans(user_id);
create index if not exists idx_loans_status on public.loans(status);
create index if not exists idx_marketplace_listings_seller_id on public.marketplace_listings(seller_id);
create index if not exists idx_marketplace_listings_category on public.marketplace_listings(category);
create index if not exists idx_marketplace_listings_status on public.marketplace_listings(status);
create index if not exists idx_marketplace_listings_location on public.marketplace_listings using gist(ll_to_earth(seller_id::int, seller_id::int));
create index if not exists idx_marketplace_orders_buyer_id on public.marketplace_orders(buyer_id);
create index if not exists idx_marketplace_orders_seller_id on public.marketplace_orders(seller_id);
create index if not exists idx_logistics_requests_user_id on public.logistics_requests(user_id);
create index if not exists idx_logistics_requests_status on public.logistics_requests(status);
create index if not exists idx_weather_alerts_region on public.weather_alerts(region);
create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_group_members_user_id on public.group_members(user_id);
create index if not exists idx_sustainability_activities_user_id on public.sustainability_activities(user_id);
create index if not exists idx_farm_production_user_id on public.farm_production(user_id);
create index if not exists idx_farm_expenses_user_id on public.farm_expenses(user_id);
