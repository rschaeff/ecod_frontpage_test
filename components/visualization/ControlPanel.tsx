// components/visualization/ControlPanel.tsx
'use client';

import React from 'react';
import { RotateCw, Eye, EyeOff, Settings } from 'lucide-react';

// Define ViewerOptions interface
export interface ViewerOptions {
  style: 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill' | 'stick' | 'sphere' | 'line';
  colorScheme?: 'chain' | 'secondary-structure' | 'residue-type' | 'hydrophobicity' | 'element';
  showSideChains: boolean;
  showLigands: boolean;
  showWater?: boolean;
  showLabels?: boolean;
  quality?: 'low' | 'medium' | 'high';
  zoom?: number;
  backgroundColor?: string;
}

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
          <option value="stick">Stick</option>
          <option value="ball-and-stick">Ball & Stick</option>
          <option value="surface">Surface</option>
          <option value="spacefill">Space Fill</option>
          <option value="sphere">Sphere</option>
          <option value="line">Line</option>
        </select>
      </div>

      {/* Color Scheme */}
      {options.colorScheme !== undefined && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Scheme
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={options.colorScheme || 'chain'}
            onChange={e => onChange({ colorScheme: e.target.value as ViewerOptions['colorScheme'] })}
            disabled={disabled}
          >
            <option value="chain">By Chain</option>
            <option value="secondary-structure">Secondary Structure</option>
            <option value="residue-type">Residue Type</option>
            <option value="hydrophobicity">Hydrophobicity</option>
            <option value="element">By Element</option>
          </select>
        </div>
      )}

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

        {/* Show Water (if option exists) */}
        {options.showWater !== undefined && (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showWater || false}
              onChange={e => onChange({ showWater: e.target.checked })}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <div className="flex items-center">
              {options.showWater ? (
                <Eye className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
              )}
              <span className="text-sm text-gray-700">Show Water</span>
            </div>
          </label>
        )}

        {/* Show Labels (if option exists) */}
        {options.showLabels !== undefined && (
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
      </div>

      {/* Quality Settings (if option exists) */}
      {options.quality !== undefined && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rendering Quality
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={options.quality || 'medium'}
            onChange={e => onChange({ quality: e.target.value as ViewerOptions['quality'] })}
            disabled={disabled}
          >
            <option value="low">Low (Fast)</option>
            <option value="medium">Medium</option>
            <option value="high">High (Slow)</option>
          </select>
        </div>
      )}

      {/* Zoom Control (if option exists) */}
      {options.zoom !== undefined && (
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
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>100%</span>
            <span>300%</span>
          </div>
        </div>
      )}

      {/* Background Color (if option exists) */}
      {options.backgroundColor !== undefined && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={options.backgroundColor || '#ffffff'}
              onChange={e => onChange({ backgroundColor: e.target.value })}
              disabled={disabled}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
            />
            <input
              type="text"
              value={options.backgroundColor || '#ffffff'}
              onChange={e => onChange({ backgroundColor: e.target.value })}
              disabled={disabled}
              className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}

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
