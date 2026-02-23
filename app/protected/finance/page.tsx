import { getLoanProducts, getMyLoanApplications } from '@/lib/actions'
import { getSession } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinanceClient } from '@/components/finance-client'

export default async function FinancePage() {
  const session = await getSession()
  const role = session?.user?.role || 'smallholder_farmer'
  const scale = role === 'commercial_farmer' || role === 'enterprise' ? 'commercial' : 'smallholder'

  const [products, applications] = await Promise.all([
    getLoanProducts(scale),
    getMyLoanApplications(),
  ])

  return (
    <div className="flex flex-col pt-16 lg:pt-0">
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Finance & Loans</h1>
          <p className="mt-2 text-gray-600">
            Access agricultural loans and financial products tailored to your needs
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Loans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {products.map((loan) => (
              <Card key={loan.id}>
                <CardHeader>
                  <CardTitle>{loan.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="font-semibold">
                      KES {Number(loan.min_amount_kes).toLocaleString()} – {Number(loan.max_amount_kes).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="font-semibold">{loan.interest_rate_pct}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tenure</p>
                    <p className="font-semibold">{loan.tenure_months} months</p>
                  </div>
                  <FinanceClient loanProductId={loan.id} loanName={loan.name} maxAmount={loan.max_amount_kes} minAmount={loan.min_amount_kes} />
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Applications</h2>
          <Card>
            <CardContent className="pt-6">
              {applications.length === 0 ? (
                <p className="text-gray-600">No active loan applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0">
                      <div>
                        <p className="font-semibold">
                          {(app as { loan_products?: { name: string } }).loan_products?.name ?? 'Loan'} – KES {Number(app.amount_kes).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied {new Date(app.created_at).toLocaleDateString()} · Status: {app.status}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
