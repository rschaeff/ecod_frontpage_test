'use client';

import React from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { useTree } from '@/contexts/TreeContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

/**
 * This hook provides a centralized way to check if all required contexts are available.
 * It can be used in components that depend on multiple contexts to verify they have been
 * properly set up before attempting to access context values.
 * 
 * @returns An object containing boolean flags indicating which contexts are available
 */
export function useContextAvailability() {
  // Check if contexts are available by attempting to use them in a try-catch block
  let searchAvailable = false;
  let treeAvailable = false;
  let preferencesAvailable = false;

  try {
    useSearch();
    searchAvailable = true;
  } catch (error) {
    // SearchContext is not available
  }

  try {
    useTree();
    treeAvailable = true;
  } catch (error) {
    // TreeContext is not available
  }

  try {
    useUserPreferences();
    preferencesAvailable = true;
  } catch (error) {
    // UserPreferencesContext is not available
  }

  return {
    searchAvailable,
    treeAvailable,
    preferencesAvailable,
    allAvailable: searchAvailable && treeAvailable && preferencesAvailable
  };
}

/**
 * A component that displays context availability status.
 * Useful for debugging context issues in development.
 */
export function ContextDebugger() {
  const { searchAvailable, treeAvailable, preferencesAvailable, allAvailable } = useContextAvailability();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-2 right-2 bg-white p-2 border border-gray-300 rounded shadow-md text-xs z-50 opacity-75 hover:opacity-100">
      <h4 className="font-semibold mb-1">Context Status:</h4>
      <ul>
        <li className={searchAvailable ? 'text-green-600' : 'text-red-600'}>
          SearchContext: {searchAvailable ? '✓' : '✗'}
        </li>
        <li className={treeAvailable ? 'text-green-600' : 'text-red-600'}>
          TreeContext: {treeAvailable ? '✓' : '✗'}
        </li>
        <li className={preferencesAvailable ? 'text-green-600' : 'text-red-600'}>
          UserPreferencesContext: {preferencesAvailable ? '✓' : '✗'}
        </li>
        <li className={allAvailable ? 'text-green-600' : 'text-red-600'}>
          All: {allAvailable ? '✓' : '✗'}
        </li>
      </ul>
    </div>
  );
}
