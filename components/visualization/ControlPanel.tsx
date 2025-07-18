// components/visualization/ControlPanel.tsx
'use client';

import React from 'react';
import { RotateCw, Eye, EyeOff, Settings, Palette } from 'lucide-react';
import { ViewerOptions, MolecularStyle, ColorScheme, SurfaceQuality } from '@/types/protein';

interface ControlPanelProps {
  options: ViewerOptions;
  onChange: (newOptions: Partial<ViewerOptions>) => void;
  onReset: () => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export default function ControlPanel({
  options,
  onChange,
  onReset,
  disabled = false,
  className = '',
  compact = false
}: ControlPanelProps) {
  const handleStyleChange = (style: MolecularStyle) => {
    onChange({ style });
  };

  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    onChange({ colorScheme });
  };

  const handleQualityChange = (quality: SurfaceQuality) => {
    onChange({ quality });
  };

  const handleToggleOption = (option: keyof ViewerOptions) => {
    const currentValue = options[option];
    if (typeof currentValue === 'boolean') {
      onChange({ [option]: !currentValue });
    }
  };

  const handleOpacityChange = (opacity: number) => {
    onChange({ opacity: opacity / 100 });
  };

  const handleZoomChange = (zoom: number) => {
    onChange({ zoom: zoom / 100 });
  };

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-3 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm flex items-center">
            <Settings className="h-4 w-4 mr-1" />
            Controls
          </h4>
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset to defaults"
            onClick={onReset}
            disabled={disabled}
          >
            <RotateCw className="h-3 w-3 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Style Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={options.style}
              onChange={e => handleStyleChange(e.target.value as MolecularStyle)}
              disabled={disabled}
            >
              <option value="cartoon">Cartoon</option>
              <option value="stick">Stick</option>
              <option value="sphere">Sphere</option>
              <option value="line">Line</option>
              <option value="surface">Surface</option>
            </select>
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={options.colorScheme || 'chain'}
              onChange={e => handleColorSchemeChange(e.target.value as ColorScheme)}
              disabled={disabled}
            >
              <option value="chain">Chain</option>
              <option value="element">Element</option>
              <option value="rainbow">Rainbow</option>
              <option value="spectrum">Spectrum</option>
              <option value="hydrophobicity">Hydrophobic</option>
            </select>
          </div>
        </div>

        {/* Quick toggles */}
        <div className="flex flex-wrap gap-1 mt-3">
          <button
            className={`px-2 py-1 text-xs rounded ${
              options.showSideChains
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
            onClick={() => handleToggleOption('showSideChains')}
            disabled={disabled}
          >
            Side Chains
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              options.showLigands
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
            onClick={() => handleToggleOption('showLigands')}
            disabled={disabled}
          >
            Ligands
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              options.showWater
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
            onClick={() => handleToggleOption('showWater')}
            disabled={disabled}
          >
            Water
          </button>
        </div>
      </div>
    );
  }

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
          onChange={e => handleStyleChange(e.target.value as MolecularStyle)}
          disabled={disabled}
        >
          <option value="cartoon">Cartoon</option>
          <option value="stick">Stick</option>
          <option value="sphere">Sphere</option>
          <option value="line">Line</option>
          <option value="surface">Surface</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose how the protein structure is rendered
        </p>
      </div>

      {/* Color Scheme Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Palette className="h-4 w-4 mr-1" />
          Color Scheme
        </label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={options.colorScheme || 'chain'}
          onChange={e => handleColorSchemeChange(e.target.value as ColorScheme)}
          disabled={disabled}
        >
          <option value="chain">By Chain</option>
          <option value="element">By Element</option>
          <option value="rainbow">Rainbow</option>
          <option value="spectrum">Spectrum</option>
          <option value="hydrophobicity">Hydrophobicity</option>
          <option value="sstype">Secondary Structure</option>
          <option value="white">White</option>
          <option value="gray">Gray</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Color atoms according to different properties
        </p>
      </div>

      {/* Surface Quality (only show if surface style is selected) */}
      {options.style === 'surface' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Surface Quality
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={options.quality || 'medium'}
            onChange={e => handleQualityChange(e.target.value as SurfaceQuality)}
            disabled={disabled}
          >
            <option value="low">Low (Fast)</option>
            <option value="medium">Medium</option>
            <option value="high">High (Slow)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Higher quality takes longer to render
          </p>
        </div>
      )}

      {/* Display Options */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700">Display Options</h4>

        {/* Show Side Chains */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.showSideChains || false}
            onChange={() => handleToggleOption('showSideChains')}
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
            checked={options.showLigands || false}
            onChange={() => handleToggleOption('showLigands')}
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

        {/* Show Water */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.showWater || false}
            onChange={() => handleToggleOption('showWater')}
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

        {/* Show Hydrogens */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.showHydrogens || false}
            onChange={() => handleToggleOption('showHydrogens')}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <div className="flex items-center">
            {options.showHydrogens ? (
              <Eye className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span className="text-sm text-gray-700">Show Hydrogens</span>
          </div>
        </label>

        {/* Show Labels */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.showLabels || false}
            onChange={() => handleToggleOption('showLabels')}
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

        {/* Wireframe */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.wireframe || false}
            onChange={() => handleToggleOption('wireframe')}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <div className="flex items-center">
            {options.wireframe ? (
              <Eye className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span className="text-sm text-gray-700">Wireframe Mode</span>
          </div>
        </label>
      </div>

      {/* Advanced Controls */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Advanced Controls</h4>

        {/* Opacity Control */}
        {typeof options.opacity === 'number' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacity: {Math.round((options.opacity || 1) * 100)}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={Math.round((options.opacity || 1) * 100)}
              onChange={e => handleOpacityChange(parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
        )}

        {/* Zoom Control */}
        {typeof options.zoom === 'number' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom: {Math.round((options.zoom || 1) * 100)}%
            </label>
            <input
              type="range"
              min="25"
              max="300"
              step="25"
              value={Math.round((options.zoom || 1) * 100)}
              onChange={e => handleZoomChange(parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
        )}

        {/* Background Color */}
        {options.backgroundColor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={options.backgroundColor}
                onChange={e => onChange({ backgroundColor: e.target.value })}
                disabled={disabled}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
              />
              <button
                onClick={() => onChange({ backgroundColor: '#ffffff' })}
                disabled={disabled}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                White
              </button>
              <button
                onClick={() => onChange({ backgroundColor: '#000000' })}
                disabled={disabled}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                Black
              </button>
            </div>
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

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 Tip: Surface rendering may be slow for large structures. Use cartoon or stick for better performance.
        </p>
      </div>
    </div>
  );
}

// Export the ViewerOptions type for use in other components
export type { ViewerOptions, MolecularStyle, ColorScheme, SurfaceQuality };// components/visualization/ControlPanel.tsx
