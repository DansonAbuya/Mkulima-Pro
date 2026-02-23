'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AdvisoryArticle } from '@/lib/db/types'

export function AdvisoryList({ articles }: { articles: AdvisoryArticle[] }) {
  const [selected, setSelected] = useState<AdvisoryArticle | null>(null)

  if (articles.length === 0) {
    return <p className="text-gray-600">No advisory articles yet. Check back soon.</p>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
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
              <Button className="w-full" onClick={() => setSelected(article)}>
                Read Article
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2 w-fit">
                  {selected.category}
                </span>
                <DialogTitle>{selected.title}</DialogTitle>
                <p className="text-sm text-gray-500">
                  {new Date(selected.created_at).toLocaleDateString()}
                  {selected.language === 'sw' && ' · Kiswahili'}
                </p>
              </DialogHeader>
              <div className="prose prose-sm max-w-none mt-4 text-gray-700 whitespace-pre-wrap">
                {selected.content || 'No content available.'}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
