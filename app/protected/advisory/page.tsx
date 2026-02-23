import { getAdvisoryArticles } from '@/lib/actions'
import { AdvisoryList } from '@/components/advisory-list'

export default async function AdvisoryPage() {
  const articles = await getAdvisoryArticles()

  return (
    <div className="flex flex-col pt-16 lg:pt-0">
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Advisory Library</h1>
          <p className="mt-2 text-gray-600">
            Get personalized farming recommendations from experienced advisors
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <AdvisoryList articles={articles} />
        </div>
      </div>
    </div>
  )
}
