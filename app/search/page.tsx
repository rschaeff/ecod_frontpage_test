// app/search/page.tsx - Main search page with Suspense boundary
import { Suspense } from 'react'
import SearchContent from './SearchContent'
import LoadingState from '@/components/ui/LoadingState'

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search ECOD Classification</h1>
      <Suspense fallback={<LoadingState message="Loading search..." />}>
        <SearchContent />
      </Suspense>
    </div>
  )
}
