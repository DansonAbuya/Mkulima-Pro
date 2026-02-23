'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createListing } from '@/lib/actions'
import type { Listing } from '@/lib/db/types'

export function MarketplaceList({
  initialListings,
  initialSearch,
  initialCategory,
}: {
  initialListings: Listing[]
  initialSearch?: string
  initialCategory?: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch ?? '')
  const [category, setCategory] = useState(initialCategory ?? '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    router.push(`/protected/marketplace?${params.toString()}`)
  }

  return (
    <>
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="Search products..."
          className="max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          <option value="Seeds">Seeds</option>
          <option value="Produce">Produce</option>
          <option value="Inputs">Inputs</option>
          <option value="Equipment">Equipment</option>
          <option value="Other">Other</option>
        </select>
        <Button type="submit">Search</Button>
        <PostListingDialog />
      </form>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {initialSearch || initialCategory ? 'Search results' : 'Listings'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialListings.length === 0 ? (
          <p className="text-gray-600 col-span-full">No listings yet. Post one to get started.</p>
        ) : (
          initialListings.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <CardDescription>
                  {product.location_county || product.location || 'Kenya'}
                  {product.is_verified_supplier && (
                    <span className="ml-2 text-green-600">✓ Verified</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-xl font-bold text-green-600">
                    KES {Number(product.price_kes).toLocaleString()}/{product.unit}
                  </p>
                </div>
                {product.quantity_available != null && (
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-sm">{product.quantity_available} {product.unit}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" size="sm">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  )
}

function PostListingDialog() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(formData: FormData) {
    setError(null)
    setPending(true)
    try {
      const title = formData.get('title') as string
      const description = (formData.get('description') as string) || undefined
      const price_kes = Number(formData.get('price_kes'))
      const unit = (formData.get('unit') as string) || 'kg'
      const category = formData.get('category') as string
      const location = (formData.get('location') as string) || undefined
      const location_county = (formData.get('location_county') as string) || undefined
      const quantity_available = formData.get('quantity_available') ? Number(formData.get('quantity_available')) : undefined
      if (!title || !category || !price_kes) throw new Error('Title, category and price are required')
      await createListing({
        title,
        description,
        price_kes,
        unit,
        category,
        location,
        location_county,
        quantity_available,
      })
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create listing')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Post Listing</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post a listing</DialogTitle>
          <DialogDescription>Add a product or produce listing to the marketplace.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await submit(new FormData(e.currentTarget as HTMLFormElement))
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required placeholder="e.g. Certified Maize Seeds" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_kes">Price (KES) *</Label>
              <Input id="price_kes" name="price_kes" type="number" min={1} required />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <select id="unit" name="unit" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="kg">kg</option>
                <option value="bag">bag</option>
                <option value="piece">piece</option>
                <option value="crate">crate</option>
                <option value="set">set</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <select id="category" name="category" required className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select</option>
              <option value="Seeds">Seeds</option>
              <option value="Produce">Produce</option>
              <option value="Inputs">Inputs</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="location_county">County</Label>
            <Input id="location_county" name="location_county" placeholder="e.g. Nakuru" />
          </div>
          <div>
            <Label htmlFor="location">Location details</Label>
            <Input id="location" name="location" placeholder="Town or area" />
          </div>
          <div>
            <Label htmlFor="quantity_available">Quantity available</Label>
            <Input id="quantity_available" name="quantity_available" type="number" min={0} placeholder="Optional" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Posting...' : 'Post listing'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
