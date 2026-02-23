import { getAdvisoryArticles } from '@/lib/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AdvisoryPage() {
  const articles = await getAdvisoryArticles()

  return (
    <div className="flex flex-col lg:ml-64 pt-16 lg:pt-0">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.length === 0 ? (
              <p className="text-gray-600">No advisory articles yet. Check back soon.</p>
            ) : (
              articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2">
                      {article.category}
                    </span>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>
                      {new Date(article.created_at).toLocaleDateString()}
                      {article.language === 'sw' && ' · Kiswahili'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {article.content && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.content}</p>
                    )}
                    <Button className="w-full">Read Article</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
