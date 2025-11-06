// app/search/page.tsx - Advanced search page with domain and cluster search
import { Suspense } from 'react'
import SearchWrapper from '@/components/wrappers/SearchWrapper'
import { SearchFormInner } from '@/components/SearchForm'
import SearchResults from '@/components/SearchResults'
import LoadingState from '@/components/ui/LoadingState'

export default function SearchPage() {
  return (
    <SearchWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search ECOD Database</h1>

        <Suspense fallback={<LoadingState message="Loading search..." />}>
          <div className="space-y-6">
            {/* Search Form */}
            <SearchFormInner
              placeholder="Search by domain ID, PDB ID, UniProt ID, or keyword..."
              showExamples={true}
              buttonClassName="rounded-lg"
              inputClassName="rounded-lg"
              examples={[
                { id: '1', label: 'Domain ID', query: 'e4ubpA1' },
                { id: '2', label: 'PDB ID', query: '1abc' },
                { id: '3', label: 'UniProt', query: 'P12345' },
                { id: '4', label: 'Keyword', query: 'kinase' },
              ]}
              saveHistory={true}
            />

            {/* Search Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Search Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Search by domain ID (e.g., "e4ubpA1")</li>
                <li>• Search by PDB ID (e.g., "1abc")</li>
                <li>• Search by UniProt accession (e.g., "P12345")</li>
                <li>• Search by keyword (e.g., "kinase", "immunoglobulin")</li>
                <li>• Search by classification ID (e.g., "1.1.1", "2.40")</li>
              </ul>
            </div>

            {/* Search Results */}
            <SearchResults />
          </div>
        </Suspense>
      </div>
    </SearchWrapper>
  )
}
