import { getListings, getMyListings } from '@/lib/actions'
import { MarketplaceList } from '@/components/marketplace-list'

type Props = { searchParams: Promise<{ q?: string; category?: string }> }

export default async function MarketplacePage({ searchParams }: Props) {
  const { q, category } = await searchParams
  const [listings, myListings] = await Promise.all([
    getListings(q, category),
    getMyListings(),
  ])
  const myListingIds = myListings.map((l) => l.id)

  return (
    <div className="flex flex-col pt-16 lg:pt-0">
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="mt-2 text-gray-600">
            Buy inputs, sell produce, and connect with nearby buyers and sellers
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <MarketplaceList
            initialListings={listings}
            initialMyListingIds={myListingIds}
            initialSearch={q}
            initialCategory={category}
          />
        </div>
      </div>
    </div>
  )
}
