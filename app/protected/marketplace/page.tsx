import { getListings } from '@/lib/actions'
import { MarketplaceList } from '@/components/marketplace-list'

type Props = { searchParams: Promise<{ q?: string; category?: string }> }

export default async function MarketplacePage({ searchParams }: Props) {
  const { q, category } = await searchParams
  const listings = await getListings(q, category)

  return (
    <div className="flex flex-col lg:ml-64 pt-16 lg:pt-0">
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
            initialSearch={q}
            initialCategory={category}
          />
        </div>
      </div>
    </div>
  )
}
