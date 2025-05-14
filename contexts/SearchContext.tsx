'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Types for search state
interface SearchResult {
  id: string;
  range: string;
  xname: string;
  hname: string;
  tname: string;
  proteinName: string;
}

interface ClusterResult {
  id: string;
  label: string;
  name: string;
}

interface SearchState {
  query: string;
  results: {
    domains: SearchResult[];
    clusters: ClusterResult[];
    totalResults: number;
  } | null;
  loading: boolean;
  error: string | null;
  searchHistory: string[];
  activeView: 'domains' | 'clusters';
}

// Types for search actions
type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: any }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'domains' | 'clusters' };

// Context type
interface SearchContextType {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

// Initial state
const initialState: SearchState = {
  query: '',
  results: null,
  loading: false,
  error: null,
  searchHistory: [],
  activeView: 'domains'
};

// Create context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Reducer function
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SEARCH_START':
      return { ...state, loading: true, error: null };
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        results: action.payload,
        loading: false,
        error: null
      };
    case 'SEARCH_ERROR':
      return { ...state, loading: false, error: action.payload, results: null };
    case 'CLEAR_SEARCH':
      return { ...state, query: '', results: null, error: null };
    case 'ADD_TO_HISTORY': {
      const newHistory = [
        action.payload,
        ...state.searchHistory.filter(item => item !== action.payload).slice(0, 9) // Keep last 10 unique searches
      ];
      return { ...state, searchHistory: newHistory };
    }
    case 'CLEAR_HISTORY':
      return { ...state, searchHistory: [] };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    default:
      return state;
  }
}

// Provider component
export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ecodSearchHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          // Initialize history from localStorage
          parsedHistory.forEach(query => {
            dispatch({ type: 'ADD_TO_HISTORY', payload: query });
          });
        }
      } catch (e) {
        console.error('Error parsing search history:', e);
        localStorage.setItem('ecodSearchHistory', JSON.stringify([]));
      }
    }
  }, []);

  // Save search history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('ecodSearchHistory', JSON.stringify(state.searchHistory));
  }, [state.searchHistory]);

  // Function to perform search
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    dispatch({ type: 'SET_QUERY', payload: query });
    dispatch({ type: 'SEARCH_START' });
    dispatch({ type: 'ADD_TO_HISTORY', payload: query });

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      dispatch({ type: 'SEARCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({
        type: 'SEARCH_ERROR',
        payload: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      console.error(error);
    }
  };

  // Function to clear search
  const clearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  return (
    <SearchContext.Provider value={{ state, dispatch, performSearch, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

// Custom hook to use the search context
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
