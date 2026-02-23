-- Loans table for finance module
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount decimal(12, 2) not null,
  currency text default 'KES',
  purpose text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'active', 'repaid', 'defaulted')),
  loan_type text check (loan_type in ('input_credit', 'equipment', 'land', 'working_capital', 'emergency')),
  interest_rate decimal(5, 2),
  duration_months integer,
  repayment_schedule text check (repayment_schedule in ('weekly', 'monthly', 'seasonal', 'lump_sum')),
  disbursement_date date,
  maturity_date date,
  approved_by uuid references public.profiles(id),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.loans enable row level security;

create policy "loans_select_own" on public.loans for select using (auth.uid() = user_id);
create policy "loans_select_admin" on public.loans for select using (
  auth.uid() in (select id from public.profiles where role in ('advisor', 'admin'))
);
create policy "loans_insert_own" on public.loans for insert with check (auth.uid() = user_id);
create policy "loans_update_admin" on public.loans for update using (
  auth.uid() in (select id from public.profiles where role in ('advisor', 'admin'))
);

-- Loan repayment tracking
create table if not exists public.loan_repayments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  amount_paid decimal(12, 2) not null,
  payment_method text check (payment_method in ('cash', 'mpesa', 'bank_transfer', 'harvest_proceeds')),
  payment_date date not null,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.loan_repayments enable row level security;

create policy "loan_repayments_select_own" on public.loan_repayments for select using (
  auth.uid() in (
    select user_id from public.loans where id = loan_id
  )
);
create policy "loan_repayments_insert_own" on public.loan_repayments for insert with check (
  auth.uid() in (
    select user_id from public.loans where id = loan_id
  )
);

-- Financial summary for farmers
create table if not exists public.farm_finances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  total_income decimal(12, 2) default 0,
  total_expenses decimal(12, 2) default 0,
  total_debt decimal(12, 2) default 0,
  active_loans integer default 0,
  last_updated timestamp with time zone default now()
);

alter table public.farm_finances enable row level security;

create policy "farm_finances_select_own" on public.farm_finances for select using (auth.uid() = user_id);
