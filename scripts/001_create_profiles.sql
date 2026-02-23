-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('smallholder', 'large_scale', 'advisor', 'enterprise')),
  avatar_url TEXT,
  location TEXT,
  district TEXT,
  county TEXT,
  farm_size_acres DECIMAL,
  farming_experience_years INTEGER,
  primary_crops TEXT[] DEFAULT '{}',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "profiles_public_view" ON public.profiles FOR SELECT USING (TRUE);

-- Create advisories table
CREATE TABLE IF NOT EXISTS public.advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('soil_health', 'pest_control', 'irrigation', 'fertilization', 'weather', 'market_prices', 'finance', 'sustainability')),
  crop_types TEXT[] DEFAULT '{}',
  target_audience TEXT CHECK (target_audience IN ('smallholder', 'large_scale', 'both')),
  impact_description TEXT,
  resources JSONB DEFAULT '{}'::jsonb,
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advisories_public_read" ON public.advisories FOR SELECT USING (TRUE);
CREATE POLICY "advisories_create" ON public.advisories FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "advisories_update_own" ON public.advisories FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "advisories_delete_own" ON public.advisories FOR DELETE USING (auth.uid() = created_by);

-- Create loan applications table
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_requested DECIMAL NOT NULL,
  currency TEXT DEFAULT 'KES',
  purpose TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'funded', 'repaying', 'completed')),
  loan_duration_months INTEGER,
  interest_rate DECIMAL,
  approved_amount DECIMAL,
  approved_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loan_applications_own" ON public.loan_applications FOR SELECT USING (auth.uid() = user_id OR auth.uid() = approved_by);
CREATE POLICY "loan_applications_insert" ON public.loan_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loan_applications_update_own" ON public.loan_applications FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = approved_by);

-- Create marketplace listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  currency TEXT DEFAULT 'KES',
  location_lat DECIMAL,
  location_lng DECIMAL,
  location_text TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  harvest_date DATE,
  certification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_public_read" ON public.marketplace_listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "listings_insert" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "listings_update_own" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "listings_delete_own" ON public.marketplace_listings FOR DELETE USING (auth.uid() = seller_id);

-- Create logistics requests table
CREATE TABLE IF NOT EXISTS public.logistics_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('pickup', 'delivery', 'transportation')),
  cargo_description TEXT NOT NULL,
  cargo_weight DECIMAL,
  pickup_location_lat DECIMAL,
  pickup_location_lng DECIMAL,
  pickup_location_text TEXT,
  delivery_location_lat DECIMAL,
  delivery_location_lng DECIMAL,
  delivery_location_text TEXT,
  pickup_date DATE,
  expected_delivery_date DATE,
  estimated_cost DECIMAL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id),
  tracking_updates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.logistics_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logistics_own_or_assigned" ON public.logistics_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = assigned_to);
CREATE POLICY "logistics_insert" ON public.logistics_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "logistics_update" ON public.logistics_requests FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = assigned_to);

-- Create weather alerts table
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  county TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('drought', 'flood', 'pest_outbreak', 'disease_outbreak', 'frost', 'extreme_heat')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  recommendations TEXT,
  affected_crops TEXT[] DEFAULT '{}',
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weather_alerts_public_read" ON public.weather_alerts FOR SELECT USING (TRUE);

-- Create groups/SACCOs table
CREATE TABLE IF NOT EXISTS public.farmer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_type TEXT CHECK (group_type IN ('sacco', 'cooperative', 'producer_group', 'other')),
  location_text TEXT,
  member_count INTEGER DEFAULT 1,
  primary_crops TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.farmer_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_public_read" ON public.farmer_groups FOR SELECT USING (TRUE);
CREATE POLICY "groups_insert" ON public.farmer_groups FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "groups_update_leader" ON public.farmer_groups FOR UPDATE USING (auth.uid() = leader_id);

-- Create group members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.farmer_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'treasurer', 'secretary', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, member_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_members_public_read" ON public.group_members FOR SELECT USING (TRUE);
CREATE POLICY "group_members_manage" ON public.group_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.farmer_groups
    WHERE id = group_id AND leader_id = auth.uid()
  )
);

-- Create carbon credits table
CREATE TABLE IF NOT EXISTS public.carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('agroforestry', 'soil_conservation', 'water_harvesting', 'renewable_energy', 'composting', 'crop_rotation')),
  activity_description TEXT NOT NULL,
  tonnes_co2_equivalent DECIMAL NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id),
  verification_date TIMESTAMP WITH TIME ZONE,
  market_value DECIMAL,
  currency TEXT DEFAULT 'KES',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.carbon_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carbon_credits_own" ON public.carbon_credits FOR SELECT USING (auth.uid() = user_id OR auth.uid() = verified_by);
CREATE POLICY "carbon_credits_insert" ON public.carbon_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.farm_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('yield', 'costs', 'revenue', 'expenses', 'profit')),
  crop_type TEXT,
  period_start DATE,
  period_end DATE,
  value DECIMAL NOT NULL,
  unit TEXT,
  currency TEXT DEFAULT 'KES',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.farm_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_own" ON public.farm_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analytics_insert" ON public.farm_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
