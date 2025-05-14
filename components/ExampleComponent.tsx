import { useSearch } from '@/contexts/SearchContext';
import { useTree } from '@/contexts/TreeContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import Link from 'next/link';
import { Search, List, Grid, Table, Moon, Sun, Settings } from 'lucide-react';

/**
 * ExampleComponent showing how to use all three contexts
 */
export default function ExampleComponent() {
  // Access search context
  const { state: searchState, performSearch, clearSearch } = useSearch();
  
  // Access tree context
  const { state: treeState, toggleNode, setActiveFilter } = useTree();
  
  // Access user preferences context
  const { preferences, setTheme, setViewMode, toggleAdvancedMode } = useUserPreferences();

  // Handler for search form submission
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('query') as string;
    performSearch(query);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Context API Example</h1>
      
      {/* Search section */}
      <section className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Search Context</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            name="query"
            placeholder="Search ECOD..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </button>
          <button 
            type="button"
            onClick={clearSearch}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
          >
            Clear
          </button>
        </form>
        
        <div>
          <p><strong>Current query:</strong> {searchState.query || 'None'}</p>
          <p><strong>Loading:</strong> {searchState.loading ? 'Yes' : 'No'}</p>
          <p><strong>Results:</strong> {searchState.results ? searchState.results.totalResults : 0}</p>
          <p>
            <strong>Search history:</strong>{' '}
            {searchState.searchHistory.length > 0 
              ? searchState.searchHistory.join(', ') 
              : 'No history'}
          </p>
        </div>
      </section>
      
      {/* Tree section */}
      <section className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Tree Context</h2>
        
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded ${
              treeState.activeFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('A')}
            className={`px-3 py-1 rounded ${
              treeState.activeFilter === 'A' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            A-groups
          </button>
          <button 
            onClick={() => setActiveFilter('X')}
            className={`px-3 py-1 rounded ${
              treeState.activeFilter === 'X' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            X-groups
          </button>
        </div>
        
        <div className="mb-4">
          <p><strong>Current filter:</strong> {treeState.activeFilter}</p>
          <p><strong>Selected node:</strong> {treeState.selectedNodeId || 'None'}</p>
          <p>
            <strong>Expanded nodes:</strong>{' '}
            {Object.keys(treeState.expandedNodes).filter(id => treeState.expandedNodes[id]).join(', ') || 'None'}
          </p>
        </div>
        
        {/* Sample tree nodes for demonstration */}
        <div className="border rounded p-2">
          <div className="mb-2">
            <button 
              onClick={() => toggleNode('A1')}
              className="flex items-center font-medium"
            >
              {treeState.expandedNodes['A1'] ? '▼' : '►'} A1: Alpha proteins
            </button>
            
            {treeState.expandedNodes['A1'] && (
              <div className="ml-5 border-l-2 border-gray-300 pl-2 mt-1">
                <button 
                  onClick={() => toggleNode('X1.1')}
                  className="flex items-center"
                >
                  {treeState.expandedNodes['X1.1'] ? '▼' : '►'} X1.1: Globin-like
                </button>
                
                {treeState.expandedNodes['X1.1'] && (
                  <div className="ml-5 border-l-2 border-gray-300 pl-2 mt-1">
                    <div>H1.1.1: Globin-like</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* User preferences section */}
      <section className="p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">User Preferences Context</h2>
        
        <div className="mb-4">
          <p><strong>Current theme:</strong> {preferences.theme}</p>
          <p><strong>View mode:</strong> {preferences.viewMode}</p>
          <p><strong>Results per page:</strong> {preferences.resultsPerPage}</p>
          <p><strong>Show experimental only:</strong> {preferences.showExperimentalOnly ? 'Yes' : 'No'}</p>
          <p><strong>Advanced mode:</strong> {preferences.advancedMode ? 'Enabled' : 'Disabled'}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`px-3 py-2 rounded flex items-center ${
              preferences.theme === 'light' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-gray-100'
            }`}
          >
            <Sun className="h-4 w-4 mr-1" />
            Light
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`px-3 py-2 rounded flex items-center ${
              preferences.theme === 'dark' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100'
            }`}
          >
            <Moon className="h-4 w-4 mr-1" />
            Dark
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded flex items-center ${
              preferences.viewMode === 'list' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100'
            }`}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </button>
          
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded flex items-center ${
              preferences.viewMode === 'grid' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100'
            }`}
          >
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </button>
          
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded flex items-center ${
              preferences.viewMode === 'table' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100'
            }`}
          >
            <Table className="h-4 w-4 mr-1" />
            Table
          </button>
          
          <button
            onClick={toggleAdvancedMode}
            className={`px-3 py-2 rounded flex items-center ${
              preferences.advancedMode ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100'
            }`}
          >
            <Settings className="h-4 w-4 mr-1" />
            {preferences.advancedMode ? 'Disable' : 'Enable'} Advanced Mode
          </button>
        </div>
      </section>
    </div>
  );
}
