-- Logistics and delivery requests
create table if not exists public.logistics_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_type text check (request_type in ('pickup', 'delivery', 'transport')),
  product_name text not null,
  quantity decimal(12, 2) not null,
  unit text not null,
  pickup_location text,
  pickup_latitude numeric,
  pickup_longitude numeric,
  delivery_location text,
  delivery_latitude numeric,
  delivery_longitude numeric,
  distance_km decimal(8, 2),
  status text default 'pending' check (status in ('pending', 'assigned', 'in_transit', 'completed', 'cancelled')),
  assigned_driver_id uuid references public.profiles(id),
  estimated_cost decimal(12, 2),
  actual_cost decimal(12, 2),
  pickup_date date,
  delivery_date_expected date,
  delivery_date_actual date,
  temperature_controlled boolean default false,
  special_handling text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.logistics_requests enable row level security;

create policy "logistics_requests_select_own" on public.logistics_requests for select using (
  auth.uid() = user_id or auth.uid() = assigned_driver_id
);
create policy "logistics_requests_select_admin" on public.logistics_requests for select using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);
create policy "logistics_requests_insert_own" on public.logistics_requests for insert with check (auth.uid() = user_id);
create policy "logistics_requests_update_own" on public.logistics_requests for update using (
  auth.uid() = user_id or auth.uid() = assigned_driver_id
);

-- Shipment tracking
create table if not exists public.shipment_tracking (
  id uuid primary key default gen_random_uuid(),
  logistics_request_id uuid not null references public.logistics_requests(id) on delete cascade,
  status text not null check (status in ('pickup_scheduled', 'picked_up', 'in_transit', 'arrived_at_destination', 'delivered')),
  location_latitude numeric,
  location_longitude numeric,
  timestamp timestamp with time zone default now(),
  notes text
);

alter table public.shipment_tracking enable row level security;

create policy "shipment_tracking_select_own" on public.shipment_tracking for select using (
  auth.uid() in (
    select user_id from public.logistics_requests where id = logistics_request_id
  )
);
