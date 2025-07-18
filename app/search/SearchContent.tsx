// app/search/SearchContent.tsx - Client component with search logic
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface SearchResult {
  id: string
  name: string
  level: string
  parent: string | null
  domainCount: number
}

interface SearchResponse {
  query: string
  results: SearchResult[]
}

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  
  const query = searchParams.get('q') || ''
  
  // Initialize search value from URL params
  useEffect(() => {
    setSearchValue(query)
  }, [query])

  // Perform search when query changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query)
    } else {
      setResults([])
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/tree/search?q=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      
      const data: SearchResponse = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the classification tree or detail page
    router.push(`/tree?node=${result.id}`)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-blue-100 text-blue-800'
      case 'X': return 'bg-green-100 text-green-800'
      case 'H': return 'bg-yellow-100 text-yellow-800'
      case 'T': return 'bg-purple-100 text-purple-800'
      case 'F': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelName = (level: string) => {
    switch (level) {
      case 'A': return 'Architecture'
      case 'X': return 'X-group'
      case 'H': return 'H-group'
      case 'T': return 'T-group'
      case 'F': return 'Family'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search ECOD classifications (e.g., 'kinase', 'a.1', 'immunoglobulin')"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !searchValue.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" color="white" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {/* Search Instructions */}
      {!query && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Search Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Search by ECOD ID (e.g., "a.1", "a.1.1")</li>
            <li>• Search by protein family name (e.g., "kinase", "immunoglobulin")</li>
            <li>• Search by structural description (e.g., "beta barrel", "alpha helix")</li>
          </ul>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <strong>Search Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <LoadingSpinner />
            <span className="text-gray-600">Searching classifications...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {query && !loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Search Results for "{query}"
            </h2>
            <span className="text-sm text-gray-600">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-medium text-lg text-blue-600">
                          {result.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(result.level)}`}>
                          {getLevelName(result.level)}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {result.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {result.parent && (
                          <span>Parent: <span className="font-mono">{result.parent}</span></span>
                        )}
                        {result.domainCount > 0 && (
                          <span>{result.domainCount} domain{result.domainCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-2">Try different search terms or check the spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
