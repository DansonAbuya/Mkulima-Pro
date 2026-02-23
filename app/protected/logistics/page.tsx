import { getMyShipments, getLogisticsPartners } from '@/lib/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogisticsClient } from '@/components/logistics-client'

export default async function LogisticsPage() {
  const [shipments, partners] = await Promise.all([
    getMyShipments(),
    getLogisticsPartners(),
  ])

  return (
    <div className="flex flex-col pt-16 lg:pt-0">
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Logistics</h1>
          <p className="mt-2 text-gray-600">
            Arrange reliable pickup and delivery for your agricultural products
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LogisticsClient partners={partners} />

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Active Shipments</h2>
          <div className="grid grid-cols-1 gap-4 mb-8">
            {shipments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-600">No shipments yet. Request a shipment above.</p>
                </CardContent>
              </Card>
            ) : (
              shipments.map((shipment) => (
                <Card key={shipment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">#{shipment.id.slice(0, 8)}</p>
                        <p className="font-semibold">{shipment.product_description}</p>
                        <p className="text-sm text-gray-600">To: {shipment.destination}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={
                            shipment.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : shipment.status === 'in_transit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {shipment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Logistics Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partners.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <CardTitle>{provider.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-semibold">{provider.rating}/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coverage</p>
                    <p className="font-semibold">
                      {Array.isArray(provider.coverage_regions) ? provider.coverage_regions.join(', ') : 'All regions'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipping Cost</p>
                    <p className="font-semibold">
                      From KES {provider.cost_min_kes?.toLocaleString() ?? '—'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
