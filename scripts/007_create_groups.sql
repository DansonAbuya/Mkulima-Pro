-- Farmer groups and SACCOs (Savings and Credit Cooperative Organizations)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  group_type text check (group_type in ('farmer_group', 'sacco', 'cooperative', 'producer_organization')),
  leader_id uuid not null references public.profiles(id) on delete cascade,
  location text,
  latitude numeric,
  longitude numeric,
  registration_number text,
  members_count integer default 1,
  founded_date date,
  image_url text,
  status text default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.groups enable row level security;

create policy "groups_select_all" on public.groups for select using (true);
create policy "groups_insert_leader" on public.groups for insert with check (auth.uid() = leader_id);
create policy "groups_update_leader" on public.groups for update using (auth.uid() = leader_id);
create policy "groups_delete_leader" on public.groups for delete using (auth.uid() = leader_id);

-- Group membership
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('member', 'treasurer', 'secretary', 'vice_leader', 'leader')),
  joined_date date default current_date,
  created_at timestamp with time zone default now(),
  unique(group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "group_members_select_own_group" on public.group_members for select using (
  auth.uid() in (
    select user_id from public.group_members where group_id = group_members.group_id
  )
);
create policy "group_members_insert_leader" on public.group_members for insert with check (
  auth.uid() in (
    select leader_id from public.groups where id = group_id
  )
);
create policy "group_members_update_leader" on public.group_members for update using (
  auth.uid() in (
    select leader_id from public.groups where id = group_id
  )
);
create policy "group_members_delete_leader" on public.group_members for delete using (
  auth.uid() in (
    select leader_id from public.groups where id = group_id
  )
);

-- Group meetings
create table if not exists public.group_meetings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  meeting_date timestamp with time zone,
  location text,
  agenda text[],
  minutes text,
  attendance_count integer,
  created_by uuid not null references public.profiles(id),
  created_at timestamp with time zone default now()
);

alter table public.group_meetings enable row level security;

create policy "group_meetings_select_own_group" on public.group_meetings for select using (
  auth.uid() in (
    select user_id from public.group_members where group_id = group_meetings.group_id
  )
);
