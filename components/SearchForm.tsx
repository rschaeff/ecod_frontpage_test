import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Search } from 'lucide-react';

/**
 * Props for the SearchForm component
 */
interface SearchFormProps {
  /** Additional CSS class to apply to the container */
  className?: string;
  /** Default search query */
  defaultQuery?: string;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether to show example searches */
  showExamples?: boolean;
  /** CSS class for the search button */
  buttonClassName?: string;
  /** CSS class for the search input */
  inputClassName?: string;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Examples to show below the search box */
  examples?: Array<{
    id: string;
    label: string;
    query: string;
  }>;
  /** Whether to save search history to localStorage */
  saveHistory?: boolean;
}

/**
 * Default example searches
 */
const DEFAULT_EXAMPLES = [
  { id: '1', label: '1.1.1.1', query: '1.1.1.1' },
  { id: '2', label: 'e4ubpA1', query: 'e4ubpA1' },
  { id: '3', label: 'P12345', query: 'P12345' },
  { id: '4', label: 'kinase', query: 'kinase' },
];

/**
 * SearchForm component for ECOD website
 *
 * A reusable search form that handles query input, submission,
 * and displays example searches.
 */
const SearchForm: React.FC<SearchFormProps> = ({
  className = '',
  defaultQuery = '',
  placeholder = 'Search by keyword, PDB ID, UniProt ID, or domain ID...',
  showExamples = true,
  buttonClassName = '',
  inputClassName = '',
  onSearch,
  examples = DEFAULT_EXAMPLES,
  saveHistory = false
}) => {
  // State for the search query
  const [query, setQuery] = useState<string>(defaultQuery);

  // State for search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // State for showing search history dropdown
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Load search history from localStorage on component mount
  useEffect(() => {
    if (saveHistory) {
      const savedHistory = localStorage.getItem('ecodSearchHistory');
      if (savedHistory) {
        try {
          setSearchHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Error parsing search history:', e);
          // Reset history if corrupt
          localStorage.setItem('ecodSearchHistory', JSON.stringify([]));
        }
      }
    }
  }, [saveHistory]);

  // Save search to history
  const saveToHistory = (searchQuery: string): void => {
    if (!saveHistory || !searchQuery.trim()) return;

    const newHistory = [
      searchQuery,
      ...searchHistory.filter(item => item !== searchQuery).slice(0, 9) // Keep last 10 unique searches
    ];

    setSearchHistory(newHistory);
    localStorage.setItem('ecodSearchHistory', JSON.stringify(newHistory));
  };

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      setShowHistory(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    // Save to search history
    saveToHistory(trimmedQuery);

    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(trimmedQuery);
      return;
    }

    // Default behavior: navigate to search page
    window.location.href = `/search?kw=${encodeURIComponent(trimmedQuery)}`;
  };

  // Handle clicking on a search history item
  const handleHistoryItemClick = (item: string): void => {
    setQuery(item);
    setShowHistory(false);

    // Navigate immediately when clicking history item
    if (onSearch) {
      onSearch(item);
    } else {
      window.location.href = `/search?kw=${encodeURIComponent(item)}`;
    }
  };

  // Handle clicking on an example search
  const handleExampleClick = (query: string, e: React.MouseEvent): void => {
    e.preventDefault();

    // Save to search history
    saveToHistory(query);

    // Navigate to search page
    window.location.href = `/search?kw=${encodeURIComponent(query)}`;
  };

  return (
    <div className={`search-form-container ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center bg-white rounded-lg overflow-hidden shadow-lg p-1 relative"
        role="search"
        aria-label="ECOD database search"
      >
        <div className="relative w-full">
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            className={`flex-grow p-3 pl-10 text-gray-800 outline-none w-full ${inputClassName}`}
            aria-label="Search query"
            autoComplete="off"
            id="ecod-search-input"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />

          {/* Search history dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg z-10 mt-1 border border-gray-200 max-h-64 overflow-y-auto">
              <ul>
                {searchHistory.map((item, index) => (
                  <li key={`history-${index}`}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 text-gray-700 text-sm focus:outline-none flex items-center"
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <Search className="h-3 w-3 text-gray-400 mr-2" aria-hidden="true" />
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
              {saveHistory && (
                <div className="border-t border-gray-200 p-2">
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700 w-full text-center"
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.removeItem('ecodSearchHistory');
                      setShowHistory(false);
                    }}
                  >
                    Clear search history
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-200 ease-in-out w-full md:w-auto mt-2 md:mt-0 ${buttonClassName}`}
          aria-label="Search"
          disabled={!query.trim()}
        >
          <Search className="inline mr-2 h-5 w-5" aria-hidden="true" />
          Search
        </button>
      </form>

      {/* Example searches */}
      {showExamples && examples.length > 0 && (
        <div className="mt-3 text-sm text-blue-100 flex flex-wrap justify-center gap-3">
          <span>Example searches: </span>
          {examples.map(example => (
            <a
              key={example.id}
              href={`/search?kw=${encodeURIComponent(example.query)}`}
              className="hover:text-white hover:underline"
              onClick={(e) => handleExampleClick(example.query, e)}
            >
              {example.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
