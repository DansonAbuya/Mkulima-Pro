import { getSession } from '@/lib/auth/session'
import { getGroupsWithMembership } from '@/lib/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GroupsClient } from '@/components/groups-client'

export default async function GroupsPage() {
  const session = await getSession()
  const groups = session?.user ? await getGroupsWithMembership(session.user.id) : []

  const myGroups = groups.filter((g) => (g as { is_member?: boolean }).is_member)
  const browseGroups = groups.filter((g) => !(g as { is_member?: boolean }).is_member)

  return (
    <div className="flex flex-col lg:ml-64 pt-16 lg:pt-0">
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Groups & SACCOs</h1>
          <p className="mt-2 text-gray-600">
            Join cooperative groups and savings associations for collective strength
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
              <GroupsClient mode="create" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myGroups.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600">You haven’t joined any groups yet. Create one or browse below.</p>
                  </CardContent>
                </Card>
              ) : (
                myGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{group.name}</CardTitle>
                          <CardDescription>{group.type}</CardDescription>
                        </div>
                        <Badge variant="outline">{(group as { member_count?: number }).member_count ?? 0} members</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {group.description && <p className="text-sm text-gray-600">{group.description}</p>}
                      {(group.location || group.county) && (
                        <p className="text-sm font-semibold text-gray-700">
                          📍 {[group.county, group.location].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" size="sm">
                          View Group
                        </Button>
                        <GroupsClient mode="leave" groupId={group.id} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {browseGroups.length === 0 ? (
              <p className="text-gray-600">No other groups yet. Create the first one!</p>
            ) : (
              browseGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>{group.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Members</p>
                      <p className="font-semibold">{(group as { member_count?: number }).member_count ?? 0}</p>
                    </div>
                    {(group.location || group.county) && (
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-sm">{[group.county, group.location].filter(Boolean).join(', ')}</p>
                      </div>
                    )}
                    <GroupsClient mode="join" groupId={group.id} />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Group Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bulk Buying</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Purchase farm inputs in bulk to get better prices and discounts.
                </p>
                <Button variant="outline" className="w-full">
                  Explore Bulk Orders
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collective Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Sell your harvest as a group to access larger markets and better prices.
                </p>
                <Button variant="outline" className="w-full">
                  Start Campaign
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Group Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Save with your group and access loans at competitive rates.
                </p>
                <Button variant="outline" className="w-full">
                  View SACCO Details
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Knowledge Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Attend group training sessions and share best farming practices.
                </p>
                <Button variant="outline" className="w-full">
                  View Trainings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
