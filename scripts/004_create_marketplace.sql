-- Products/Listings table for marketplace
create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  product_name text not null,
  category text not null check (category in ('fresh_produce', 'grains', 'pulses', 'seeds', 'equipment', 'inputs', 'livestock')),
  description text,
  quantity_available decimal(12, 2) not null,
  unit text not null check (unit in ('kg', 'bag', 'unit', 'liter', 'bundle', 'box')),
  price_per_unit decimal(12, 2) not null,
  currency text default 'KES',
  quality_grade text check (quality_grade in ('premium', 'standard', 'economy')),
  harvest_date date,
  delivery_available boolean default true,
  delivery_radius_km integer default 50,
  images text[] default '{}',
  status text default 'active' check (status in ('active', 'inactive', 'sold_out', 'archived')),
  total_sales integer default 0,
  rating decimal(3, 2) default 0,
  verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.marketplace_listings enable row level security;

create policy "marketplace_listings_select_active" on public.marketplace_listings for select using (status = 'active' or auth.uid() = seller_id);
create policy "marketplace_listings_insert_own" on public.marketplace_listings for insert with check (auth.uid() = seller_id);
create policy "marketplace_listings_update_own" on public.marketplace_listings for update using (auth.uid() = seller_id);
create policy "marketplace_listings_delete_own" on public.marketplace_listings for delete using (auth.uid() = seller_id);

-- Marketplace orders/transactions
create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  quantity_ordered decimal(12, 2) not null,
  total_price decimal(12, 2) not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  pickup_location text,
  delivery_location text,
  order_date timestamp with time zone default now(),
  delivery_date date,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.marketplace_orders enable row level security;

create policy "marketplace_orders_select_own" on public.marketplace_orders for select using (
  auth.uid() = buyer_id or auth.uid() = seller_id
);
create policy "marketplace_orders_insert_own" on public.marketplace_orders for insert with check (auth.uid() = buyer_id);
create policy "marketplace_orders_update_own" on public.marketplace_orders for update using (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

-- Order reviews
create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table public.marketplace_reviews enable row level security;

create policy "marketplace_reviews_select_all" on public.marketplace_reviews for select using (true);
create policy "marketplace_reviews_insert_own" on public.marketplace_reviews for insert with check (auth.uid() = reviewer_id);
