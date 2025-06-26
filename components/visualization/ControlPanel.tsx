// components/visualization/ControlPanel.tsx
'use client';

import React from 'react';
import { RotateCw, Eye, EyeOff, Settings } from 'lucide-react';
import { ViewerOptions } from '@/types/protein'; // IMPORT from canonical location


interface ControlPanelProps {
  options: ViewerOptions;
  onChange: (newOptions: Partial<ViewerOptions>) => void;
  onReset: () => void;
  disabled?: boolean;
  className?: string;
}

export default function ControlPanel({
  options,
  onChange,
  onReset,
  disabled = false,
  className = ''
}: ControlPanelProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Visualization Controls
        </h3>
        <button
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset to defaults"
          onClick={onReset}
          disabled={disabled}
        >
          <RotateCw className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Display Style Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Style
        </label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={options.style}
          onChange={e => onChange({ style: e.target.value as ViewerOptions['style'] })}
          disabled={disabled}
        >
          <option value="cartoon">Cartoon</option>
          <option value="ball-and-stick">Ball & Stick</option>
          <option value="surface">Surface</option>
          <option value="spacefill">Space Fill</option>
        </select>
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Display Options</h4>

        {/* Show Side Chains */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.showSideChains}
            onChange={e => onChange({ showSideChains: e.target.checked })}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <div className="flex items-center">
            {options.showSideChains ? (
              <Eye className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span className="text-sm text-gray-700">Show Side Chains</span>
          </div>
        </label>

        {/* Show Ligands */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.showLigands}
            onChange={e => onChange({ showLigands: e.target.checked })}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <div className="flex items-center">
            {options.showLigands ? (
              <Eye className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span className="text-sm text-gray-700">Show Ligands</span>
          </div>
        </label>

        {/* Show Labels (if property exists) */}
        {'showLabels' in options && (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showLabels || false}
              onChange={e => onChange({ showLabels: e.target.checked })}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <div className="flex items-center">
              {options.showLabels ? (
                <Eye className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
              )}
              <span className="text-sm text-gray-700">Show Labels</span>
            </div>
          </label>
        )}

        {/* Zoom Control (if property exists) */}
        {'zoom' in options && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom Level: {Math.round((options.zoom || 1) * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={options.zoom || 1}
              onChange={e => onChange({ zoom: parseFloat(e.target.value) })}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onReset}
          disabled={disabled}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

// Export the ViewerOptions type for use in other components
export type { ViewerOptions };
