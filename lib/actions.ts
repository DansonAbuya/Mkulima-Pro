'use server'

import { getSession } from '@/lib/auth/session'
import { getPool } from '@/lib/db/pool'
import { revalidatePath } from 'next/cache'

export async function getListings(search?: string, category?: string) {
  const pool = getPool()
  if (!pool) return []
  if (search) {
    const params = category ? [`%${search}%`, category] : [`%${search}%`]
    const { rows } = await pool.query(
      `SELECT * FROM listings WHERE (title ILIKE $1 OR description ILIKE $1) ${category ? 'AND category = $2' : ''} ORDER BY created_at DESC`,
      params
    )
    return rows ?? []
  }
  if (category) {
    const { rows } = await pool.query('SELECT * FROM listings WHERE category = $1 ORDER BY created_at DESC', [category])
    return rows ?? []
  }
  const { rows } = await pool.query('SELECT * FROM listings ORDER BY created_at DESC')
  return rows ?? []
}

export async function getMyListings() {
  const session = await getSession()
  if (!session?.user) return []
  const pool = getPool()
  if (!pool) return []
  const { rows } = await pool.query('SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC', [session.user.id])
  return rows ?? []
}

export async function createListing(form: {
  title: string
  description?: string
  price_kes: number
  unit?: string
  category: string
  location?: string
  location_county?: string
  quantity_available?: number
  is_verified_supplier?: boolean
}) {
  const session = await getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  await pool.query(
    `INSERT INTO listings (user_id, title, description, price_kes, unit, category, location, location_county, quantity_available, is_verified_supplier)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      session.user.id,
      form.title,
      form.description ?? null,
      form.price_kes,
      form.unit ?? 'kg',
      form.category,
      form.location ?? null,
      form.location_county ?? null,
      form.quantity_available ?? null,
      form.is_verified_supplier ?? false,
    ]
  )
  revalidatePath('/protected/marketplace')
  revalidatePath('/protected')
}

export async function createListingFromFormData(formData: FormData) {
  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || undefined
  const price_kes = Number(formData.get('price_kes'))
  const unit = (formData.get('unit') as string) || 'kg'
  const category = formData.get('category') as string
  const location = (formData.get('location') as string) || undefined
  const location_county = (formData.get('location_county') as string) || undefined
  const quantity_available = formData.get('quantity_available') ? Number(formData.get('quantity_available')) : undefined
  if (!title || !category || !price_kes) return { error: 'Title, category and price are required' }
  try {
    await createListing({ title, description, price_kes, unit, category, location, location_county, quantity_available })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create listing' }
  }
}

export async function deleteListing(id: string) {
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  await pool.query('DELETE FROM listings WHERE id = $1', [id])
  revalidatePath('/protected/marketplace')
  revalidatePath('/protected')
}

// ---------- Loan products & applications ----------
export async function getLoanProducts(scale?: string) {
  const pool = getPool()
  if (!pool) return []
  const { rows } = scale && scale !== 'all'
    ? await pool.query('SELECT * FROM loan_products WHERE scale_type = $1 OR scale_type = $2 ORDER BY max_amount_kes ASC', [scale, 'all'])
    : await pool.query('SELECT * FROM loan_products ORDER BY max_amount_kes ASC')
  return rows ?? []
}

export async function getMyLoanApplications() {
  const session = await getSession()
  if (!session?.user) return []
  const pool = getPool()
  if (!pool) return []
  const { rows } = await pool.query(
    `SELECT la.*, lp.name as product_name
     FROM loan_applications la
     LEFT JOIN loan_products lp ON la.loan_product_id = lp.id
     WHERE la.user_id = $1 ORDER BY la.created_at DESC`,
    [session.user.id]
  )
  return (rows ?? []).map((r: { product_name?: string }) => ({
    ...r,
    loan_products: r.product_name ? { name: r.product_name } : null,
  }))
}

export async function applyForLoan(loan_product_id: string, amount_kes: number) {
  const session = await getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  await pool.query('INSERT INTO loan_applications (user_id, loan_product_id, amount_kes, status) VALUES ($1, $2, $3, $4)', [
    session.user.id,
    loan_product_id,
    amount_kes,
    'pending',
  ])
  revalidatePath('/protected/finance')
  revalidatePath('/protected')
}

// ---------- Shipments & logistics ----------
export async function getLogisticsPartners() {
  const pool = getPool()
  if (!pool) return []
  const { rows } = await pool.query('SELECT * FROM logistics_partners')
  return rows ?? []
}

export async function getMyShipments() {
  const session = await getSession()
  if (!session?.user) return []
  const pool = getPool()
  if (!pool) return []
  const { rows } = await pool.query(
    `SELECT s.*, lp.name as partner_name, lp.rating, lp.cost_min_kes
     FROM shipments s
     LEFT JOIN logistics_partners lp ON s.partner_id = lp.id
     WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
    [session.user.id]
  )
  return (rows ?? []).map((r: { partner_name?: string }) => ({ ...r, logistics_partners: r.partner_name ? { name: r.partner_name, rating: r.rating, cost_min_kes: r.cost_min_kes } : null }))
}

export async function requestShipment(form: {
  product_description: string
  destination: string
  destination_county?: string
  origin_location?: string
  partner_id?: string
}) {
  const session = await getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  await pool.query(
    `INSERT INTO shipments (user_id, product_description, destination, destination_county, origin_location, partner_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      session.user.id,
      form.product_description,
      form.destination,
      form.destination_county ?? null,
      form.origin_location ?? null,
      form.partner_id ?? null,
      'requested',
    ]
  )
  revalidatePath('/protected/logistics')
  revalidatePath('/protected')
}

// ---------- Groups ----------
export async function getGroups() {
  const pool = getPool()
  if (!pool) return []
  const { rows } = await pool.query('SELECT * FROM groups ORDER BY name')
  return rows ?? []
}

export async function getMyGroupIds() {
  const session = await getSession()
  if (!session?.user) return []
  const pool = getPool()
  if (!pool) return []
  const { rows } = await pool.query('SELECT group_id FROM group_members WHERE user_id = $1', [session.user.id])
  return (rows ?? []).map((r: { group_id: string }) => r.group_id)
}

export async function getGroupsWithMembership(userId: string) {
  const pool = getPool()
  if (!pool) return []
  const { rows: groups } = await pool.query('SELECT * FROM groups ORDER BY name')
  const { rows: members } = await pool.query('SELECT group_id FROM group_members WHERE user_id = $1', [userId])
  const memberSet = new Set((members ?? []).map((m: { group_id: string }) => m.group_id))
  const withCount = await Promise.all(
    (groups ?? []).map(async (g: { id: string }) => {
      const { rows: countRows } = await pool.query('SELECT COUNT(*)::int as c FROM group_members WHERE group_id = $1', [g.id])
      return { ...g, member_count: countRows?.[0]?.c ?? 0, is_member: memberSet.has(g.id) }
    })
  )
  return withCount
}

export async function createGroup(form: { name: string; type: string; description?: string; location?: string; county?: string }) {
  const session = await getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  const { rows } = await pool.query(
    `INSERT INTO groups (name, type, description, location, county, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [form.name, form.type, form.description ?? null, form.location ?? null, form.county ?? null, session.user.id]
  )
  const groupId = rows?.[0]?.id
  if (!groupId) throw new Error('Failed to create group')
  await pool.query('INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)', [groupId, session.user.id, 'admin'])
  revalidatePath('/protected/groups')
}

export async function joinGroup(groupId: string) {
  const session = await getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  await pool.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupId, session.user.id])
  revalidatePath('/protected/groups')
}

export async function leaveGroup(groupId: string) {
  const session = await getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  await pool.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, session.user.id])
  revalidatePath('/protected/groups')
}

// ---------- Advisory ----------
export async function getAdvisoryArticles() {
  const pool = getPool()
  if (!pool) return []
  const { rows } = await pool.query('SELECT * FROM advisory_articles ORDER BY created_at DESC')
  return rows ?? []
}

// ---------- Carbon / analytics ----------
export async function getMyCarbonEntries() {
  const session = await getSession()
  if (!session?.user) return []
  const pool = getPool()
  if (!pool) return []
  const { rows } = await pool.query('SELECT * FROM carbon_entries WHERE user_id = $1 ORDER BY created_at DESC', [session.user.id])
  return rows ?? []
}

export async function addCarbonEntry(form: { activity_type: string; co2_tons: number; credits_earned?: number }) {
  const session = await getSession()
  if (!session?.user) throw new Error('Not authenticated')
  const pool = getPool()
  if (!pool) throw new Error('Database not configured')
  await pool.query(
    'INSERT INTO carbon_entries (user_id, activity_type, co2_tons, credits_earned) VALUES ($1, $2, $3, $4)',
    [session.user.id, form.activity_type, form.co2_tons, form.credits_earned ?? form.co2_tons]
  )
  revalidatePath('/protected/analytics')
}
