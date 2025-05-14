'use client';

import React from 'react';
import { ContextDebugger, useContextAvailability } from '@/utils/ContextDebugger';
import { useSearch } from '@/contexts/SearchContext';
import Link from 'next/link';

/**
 * A simple demo page that allows you to test context availability
 * and debug any issues with the context providers.
 */
export default function ContextPage() {
  const { searchAvailable, treeAvailable, preferencesAvailable, allAvailable } = useContextAvailability();
  
  let searchState = null;
  let searchError = null;
  
  try {
    // Only try to use the search context if it's available
    if (searchAvailable) {
      const searchContext = useSearch();
      searchState = searchContext.state;
    }
  } catch (error) {
    if (error instanceof Error) {
      searchError = error.message;
    } else {
      searchError = 'Unknown error occurred when accessing search context';
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Context Debugging Page</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Context Availability</h2>
        
        <div className="space-y-2 mb-6">
          <div className={`p-2 rounded ${searchAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className="font-medium">SearchContext:</span> 
            {searchAvailable ? ' Available ✓' : ' Not Available ✗'}
            {searchError && (
              <div className="mt-1 text-red-600 text-sm">
                <span className="font-medium">Error:</span> {searchError}
              </div>
            )}
          </div>
          
          <div className={`p-2 rounded ${treeAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className="font-medium">TreeContext:</span> 
            {treeAvailable ? ' Available ✓' : ' Not Available ✗'}
          </div>
          
          <div className={`p-2 rounded ${preferencesAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className="font-medium">UserPreferencesContext:</span> 
            {preferencesAvailable ? ' Available ✓' : ' Not Available ✗'}
          </div>
          
          <div className={`p-2 rounded ${allAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className="font-medium">All Contexts:</span> 
            {allAvailable ? ' Available ✓' : ' Not Available ✗'}
          </div>
        </div>
        
        {searchAvailable && searchState && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Search State Info:</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div><span className="font-medium">Current Query:</span> {searchState.query || 'None'}</div>
              <div><span className="font-medium">Loading:</span> {searchState.loading ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Error:</span> {searchState.error || 'None'}</div>
              <div>
                <span className="font-medium">Search History:</span> 
                {searchState.searchHistory && searchState.searchHistory.length > 0 
                  ? searchState.searchHistory.join(', ') 
                  : ' No history'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        <div className="space-y-2">
          <div>
            <Link href="/" className="text-blue-600 hover:underline">
              Home Page
            </Link>
          </div>
          <div>
            <Link href="/example" className="text-blue-600 hover:underline">
              Example Component (with Context Wrapper)
            </Link>
          </div>
          <div>
            <Link href="/protein" className="text-blue-600 hover:underline">
              Protein Page
            </Link>
          </div>
        </div>
      </div>
      
      <ContextDebugger />
    </div>
  );
}
