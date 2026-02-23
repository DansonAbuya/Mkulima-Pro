'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { createListing, deleteListing } from '@/lib/actions'
import type { Listing } from '@/lib/db/types'

export function MarketplaceList({
  initialListings,
  initialMyListingIds = [],
  initialSearch,
  initialCategory,
}: {
  initialListings: Listing[]
  initialMyListingIds?: string[]
  initialSearch?: string
  initialCategory?: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch ?? '')
  const [category, setCategory] = useState(initialCategory ?? '')
  const myIds = new Set(initialMyListingIds)

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
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button className="flex-1" size="sm" asChild>
                    <a href={`mailto:?subject=Inquiry: ${encodeURIComponent(product.title)}`}>Contact</a>
                  </Button>
                  {myIds.has(product.id) && (
                    <ListingDeleteButton listingId={product.id} listingTitle={product.title} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  )
}

function ListingDeleteButton({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  async function handleDelete() {
    if (!confirm(`Remove listing "${listingTitle}"?`)) return
    setPending(true)
    try {
      await deleteListing(listingId)
      toast.success('Listing removed')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setPending(false)
    }
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={handleDelete} disabled={pending}>
      {pending ? 'Removing...' : 'Remove'}
    </Button>
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
      toast.success('Listing posted successfully')
      setOpen(false)
      router.refresh()
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
          className="space-y-4 min-w-0"
        >
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required placeholder="e.g. Certified Maize Seeds" className="w-full" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief description" className="w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_kes">Price (KES) *</Label>
              <Input id="price_kes" name="price_kes" type="number" min={1} required className="w-full" />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <select id="unit" name="unit" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm">
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
            <select id="category" name="category" required className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm">
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
            <Input id="location_county" name="location_county" placeholder="e.g. Nakuru" className="w-full" />
          </div>
          <div>
            <Label htmlFor="location">Location details</Label>
            <Input id="location" name="location" placeholder="Town or area" className="w-full" />
          </div>
          <div>
            <Label htmlFor="quantity_available">Quantity available</Label>
            <Input id="quantity_available" name="quantity_available" type="number" min={0} placeholder="Optional" className="w-full" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? 'Posting...' : 'Post listing'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
