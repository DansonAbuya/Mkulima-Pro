-- Weather alerts and climate data
create table if not exists public.weather_alerts (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  latitude numeric,
  longitude numeric,
  alert_type text check (alert_type in ('drought', 'excess_rainfall', 'frost', 'pest_outbreak', 'disease_outbreak', 'heat_wave')),
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  title text not null,
  description text not null,
  recommended_actions text[],
  start_date date,
  end_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.weather_alerts enable row level security;

create policy "weather_alerts_select_all" on public.weather_alerts for select using (true);

-- Weather subscriptions by user
create table if not exists public.weather_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  latitude numeric not null,
  longitude numeric not null,
  radius_km integer default 20,
  alert_types text[] default '{}',
  created_at timestamp with time zone default now(),
  unique(user_id, latitude, longitude)
);

alter table public.weather_subscriptions enable row level security;

create policy "weather_subscriptions_select_own" on public.weather_subscriptions for select using (auth.uid() = user_id);
create policy "weather_subscriptions_insert_own" on public.weather_subscriptions for insert with check (auth.uid() = user_id);
create policy "weather_subscriptions_update_own" on public.weather_subscriptions for update using (auth.uid() = user_id);
create policy "weather_subscriptions_delete_own" on public.weather_subscriptions for delete using (auth.uid() = user_id);

-- Climate/seasonal insights
create table if not exists public.climate_insights (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  season text check (season in ('rainy', 'dry')),
  year integer,
  expected_rainfall_mm integer,
  temperature_range_min integer,
  temperature_range_max integer,
  recommended_crops text[],
  planting_dates text,
  harvesting_dates text,
  additional_notes text,
  created_at timestamp with time zone default now()
);

alter table public.climate_insights enable row level security;

create policy "climate_insights_select_all" on public.climate_insights for select using (true);
