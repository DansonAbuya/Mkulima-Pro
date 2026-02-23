import { getSession } from '@/lib/auth/session'
import { getMyLoanApplications, getMyListings, getMyShipments } from '@/lib/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()
  const userRole = session?.user?.role || 'farmer'
  const firstName = session?.user?.first_name || 'User'

  const [applications, myListings, shipments] = await Promise.all([
    getMyLoanApplications(),
    getMyListings(),
    getMyShipments(),
  ])
  const pendingLoans = applications.filter((a) => a.status === 'pending').length
  const inTransit = shipments.filter((s) => s.status === 'in_transit').length

  const quickActions = [
    {
      title: 'Browse Advisory',
      description: 'Get farming recommendations',
      href: '/protected/advisory',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Apply for Loan',
      description: 'Explore financing options',
      href: '/protected/finance',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Visit Marketplace',
      description: 'Buy inputs & sell produce',
      href: '/protected/marketplace',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Track Shipments',
      description: 'Manage logistics',
      href: '/protected/logistics',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="flex flex-col pt-16 lg:pt-0">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            {userRole === 'smallholder_farmer'
              ? 'Manage your small-scale farming operations and connect with larger markets.'
              : userRole === 'commercial_farmer'
              ? 'Optimize your commercial farming operations with data-driven insights.'
              : userRole === 'advisor'
              ? 'Help farmers make better decisions with your expertise.'
              : 'Connect with farmers and source quality products.'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Loan Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {pendingLoans} pending · <Link href="/protected/finance" className="underline">View</Link>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Marketplace Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myListings.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  <Link href="/protected/marketplace" className="underline">Post listing</Link>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Shipments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inTransit}</div>
                <p className="text-xs text-gray-500 mt-1">{shipments.length} total · <Link href="/protected/logistics" className="underline">Track</Link></p>
              </CardContent>
            </Card>
          </div>

          {/* Featured Resources */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started Guide</CardTitle>
                  <CardDescription>
                    Learn how to make the most of Mkulima Pro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Latest Weather Alert</CardTitle>
                  <CardDescription>
                    Stay informed about weather patterns in your region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/protected/weather">
                    <Button variant="outline" className="w-full">
                      Check Weather
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
