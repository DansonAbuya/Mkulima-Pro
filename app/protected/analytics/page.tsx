import { getMyCarbonEntries } from '@/lib/actions'
import { getSession } from '@/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsClient } from '@/components/analytics-client'

export default async function AnalyticsPage() {
  const session = await getSession()
  const role = (session?.user?.role as string) || 'smallholder_farmer'
  const isLargeScale = role === 'commercial_farmer' || role === 'enterprise'

  const carbonEntries = await getMyCarbonEntries()
  const totalCo2 = carbonEntries.reduce((s, e) => s + Number(e.co2_tons), 0)
  const totalCredits = carbonEntries.reduce((s, e) => s + Number(e.credits_earned), 0)
  const verifiedCredits = carbonEntries.filter((e) => e.verified).reduce((s, e) => s + Number(e.credits_earned), 0)

  return (
    <div className="flex flex-col lg:ml-64 pt-16 lg:pt-0">
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track your farming performance with detailed insights and analytics
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-2">Total Yield (This Season)</p>
                <p className="text-2xl font-bold text-green-600">—</p>
                <p className="text-xs text-gray-500 mt-1">Log harvests to see data</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">—</p>
                <p className="text-xs text-gray-500 mt-1">Link to sales to see data</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-2">Carbon Sequestered</p>
                <p className="text-2xl font-bold text-green-600">{totalCo2.toFixed(1)} tons CO₂</p>
                <p className="text-xs text-gray-500 mt-1">From sustainable practices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-2">Carbon Credits Earned</p>
                <p className="text-2xl font-bold text-green-600">{totalCredits.toFixed(1)} credits</p>
                <p className="text-xs text-gray-500 mt-1">≈ ${(totalCredits * 15).toFixed(2)} @ $15/credit</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Carbon Credits & Sustainability</h2>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Environmental Impact</CardTitle>
              <CardDescription>
                Track your sustainable farming practices and earn carbon credits
                {isLargeScale && ' · Industrial verification available for large-scale.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Carbon Sequestered</p>
                  <p className="text-2xl font-bold text-green-600">{totalCo2.toFixed(1)} tons CO₂</p>
                  <p className="text-xs text-gray-500">Via sustainable activities</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Carbon Credits Earned</p>
                  <p className="text-2xl font-bold text-green-600">{totalCredits.toFixed(1)} credits</p>
                  <p className="text-xs text-gray-500">@ $15 per credit ≈ ${(totalCredits * 15).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verified Credits</p>
                  <p className="text-2xl font-bold">{verifiedCredits.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{carbonEntries.filter((e) => e.verified).length} activities verified</p>
                </div>
              </div>
              <AnalyticsClient />
            </CardContent>
          </Card>

          {carbonEntries.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Recent activities</h3>
              <div className="space-y-2">
                {carbonEntries.slice(0, 10).map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium capitalize">{entry.activity_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{entry.co2_tons} tons CO₂</p>
                        <p className="text-xs">{entry.credits_earned} credits {entry.verified && '✓ Verified'}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
