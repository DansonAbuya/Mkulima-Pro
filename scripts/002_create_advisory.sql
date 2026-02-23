-- Advisory Library table
create table if not exists public.advisories (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null check (category in ('crop_management', 'pest_control', 'soil_health', 'irrigation', 'harvesting', 'post_harvest', 'market_tips', 'climate_adaptation')),
  content text not null,
  tags text[] default '{}',
  target_farmer_type text check (target_farmer_type in ('smallholder', 'large_scale', 'both')),
  crops text[] default '{}',
  season text check (season in ('rainy', 'dry', 'year_round')),
  priority text default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  image_url text,
  attachments text[] default '{}',
  views integer default 0,
  helpful_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.advisories enable row level security;

-- Advisory RLS Policies
create policy "advisories_select_all" on public.advisories for select using (true);
create policy "advisories_insert_advisors" on public.advisories for insert with check (
  auth.uid() in (
    select id from public.profiles where role = 'advisor'
  )
);
create policy "advisories_update_own" on public.advisories for update using (auth.uid() = created_by);
create policy "advisories_delete_own" on public.advisories for delete using (auth.uid() = created_by);

-- Advisory helpfulness tracking
create table if not exists public.advisory_feedback (
  id uuid primary key default gen_random_uuid(),
  advisory_id uuid not null references public.advisories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_helpful boolean not null,
  comment text,
  created_at timestamp with time zone default now(),
  unique(advisory_id, user_id)
);

alter table public.advisory_feedback enable row level security;

create policy "advisory_feedback_select_own" on public.advisory_feedback for select using (auth.uid() = user_id);
create policy "advisory_feedback_insert_own" on public.advisory_feedback for insert with check (auth.uid() = user_id);
create policy "advisory_feedback_update_own" on public.advisory_feedback for update using (auth.uid() = user_id);
create policy "advisory_feedback_delete_own" on public.advisory_feedback for delete using (auth.uid() = user_id);
