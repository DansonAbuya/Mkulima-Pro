// Database types for Mkulima Pro (PostgreSQL / AWS RDS)

export type UserRole = 'smallholder_farmer' | 'commercial_farmer' | 'advisor' | 'enterprise'

export interface Profile {
  id: string
  role?: string
  farm_size_hectares?: number | null
  county?: string | null
  phone?: string | null
  [key: string]: unknown
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  price_kes: number
  unit: string
  category: string
  location: string | null
  location_county: string | null
  quantity_available: number | null
  is_verified_supplier: boolean
  traceability_id: string | null
  created_at: string
  updated_at: string
}

export interface LoanProduct {
  id: string
  name: string
  max_amount_kes: number
  min_amount_kes: number
  interest_rate_pct: number
  tenure_months: number
  scale_type: string
  created_at: string
}

export interface LoanApplication {
  id: string
  user_id: string
  loan_product_id: string | null
  amount_kes: number
  status: string
  created_at: string
  updated_at: string
  loan_products?: LoanProduct | null
}

export interface LogisticsPartner {
  id: string
  name: string
  rating: number
  coverage_regions: string[] | null
  cost_min_kes: number | null
  created_at: string
}

export interface Shipment {
  id: string
  user_id: string
  product_description: string
  destination: string
  status: string
  partner_id: string | null
  origin_location: string | null
  destination_county: string | null
  created_at: string
  updated_at: string
  logistics_partners?: LogisticsPartner | null
}

export interface Group {
  id: string
  name: string
  type: string
  description: string | null
  location: string | null
  county: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  member_count?: number
}

export interface AdvisoryArticle {
  id: string
  title: string
  category: string
  content: string | null
  language: string
  created_at: string
}

export interface CarbonEntry {
  id: string
  user_id: string
  activity_type: string
  co2_tons: number
  credits_earned: number
  verified: boolean
  created_at: string
}
