import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Types for user preferences
interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  viewMode: 'list' | 'grid' | 'table';
  resultsPerPage: number;
  showExperimentalOnly: boolean;
  advancedMode: boolean;
}

// Types for user preference actions
type UserPreferencesAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'grid' | 'table' }
  | { type: 'SET_RESULTS_PER_PAGE'; payload: number }
  | { type: 'TOGGLE_EXPERIMENTAL_ONLY' }
  | { type: 'TOGGLE_ADVANCED_MODE' }
  | { type: 'RESET_PREFERENCES' };

// Context type
interface UserPreferencesContextType {
  preferences: UserPreferences;
  dispatch: React.Dispatch<UserPreferencesAction>;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setViewMode: (mode: 'list' | 'grid' | 'table') => void;
  setResultsPerPage: (count: number) => void;
  toggleExperimentalOnly: () => void;
  toggleAdvancedMode: () => void;
  resetPreferences: () => void;
}

// Initial state
const initialPreferences: UserPreferences = {
  theme: 'system',
  viewMode: 'list',
  resultsPerPage: 20,
  showExperimentalOnly: false,
  advancedMode: false
};

// Create context
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Reducer function
function userPreferencesReducer(state: UserPreferences, action: UserPreferencesAction): UserPreferences {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_RESULTS_PER_PAGE':
      return { ...state, resultsPerPage: action.payload };
    case 'TOGGLE_EXPERIMENTAL_ONLY':
      return { ...state, showExperimentalOnly: !state.showExperimentalOnly };
    case 'TOGGLE_ADVANCED_MODE':
      return { ...state, advancedMode: !state.advancedMode };
    case 'RESET_PREFERENCES':
      return { ...initialPreferences };
    default:
      return state;
  }
}

// Provider component
export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, dispatch] = useReducer(userPreferencesReducer, initialPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('ecodUserPreferences');
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        // Apply each saved preference
        if (parsedPreferences.theme) {
          dispatch({ type: 'SET_THEME', payload: parsedPreferences.theme });
        }
        if (parsedPreferences.viewMode) {
          dispatch({ type: 'SET_VIEW_MODE', payload: parsedPreferences.viewMode });
        }
        if (parsedPreferences.resultsPerPage) {
          dispatch({ type: 'SET_RESULTS_PER_PAGE', payload: parsedPreferences.resultsPerPage });
        }
        if (parsedPreferences.showExperimentalOnly !== undefined && 
            parsedPreferences.showExperimentalOnly !== preferences.showExperimentalOnly) {
          dispatch({ type: 'TOGGLE_EXPERIMENTAL_ONLY' });
        }
        if (parsedPreferences.advancedMode !== undefined && 
            parsedPreferences.advancedMode !== preferences.advancedMode) {
          dispatch({ type: 'TOGGLE_ADVANCED_MODE' });
        }
      } catch (e) {
        console.error('Error parsing user preferences:', e);
        localStorage.setItem('ecodUserPreferences', JSON.stringify(initialPreferences));
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('ecodUserPreferences', JSON.stringify(preferences));
    
    // Apply theme to document
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [preferences]);

  // Convenience methods
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setViewMode = (mode: 'list' | 'grid' | 'table') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const setResultsPerPage = (count: number) => {
    dispatch({ type: 'SET_RESULTS_PER_PAGE', payload: count });
  };

  const toggleExperimentalOnly = () => {
    dispatch({ type: 'TOGGLE_EXPERIMENTAL_ONLY' });
  };

  const toggleAdvancedMode = () => {
    dispatch({ type: 'TOGGLE_ADVANCED_MODE' });
  };

  const resetPreferences = () => {
    dispatch({ type: 'RESET_PREFERENCES' });
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        dispatch,
        setTheme,
        setViewMode,
        setResultsPerPage,
        toggleExperimentalOnly,
        toggleAdvancedMode,
        resetPreferences
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

// Custom hook to use the user preferences context
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
