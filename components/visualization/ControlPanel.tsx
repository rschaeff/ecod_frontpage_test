// Create components/visualization/ControlPanel.tsx
interface ControlPanelProps {
  options: ViewerOptions;
  onChange: (newOptions: Partial<ViewerOptions>) => void;
  onReset: () => void;
}

export default function ControlPanel({ options, onChange, onReset }: ControlPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Visualization Controls</h3>
        <button 
          className="p-1 rounded hover:bg-gray-100" 
          title="Reset to defaults"
          onClick={onReset}
        >
          <RotateCw className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      
      {/* Style selector */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Display Style</label>
        <select 
          className="w-full border rounded px-3 py-1.5 text-sm" 
          value={options.style}
          onChange={e => onChange({ style: e.target.value as any })}
        >
          <option value="cartoon">Cartoon</option>
          <option value="ball-and-stick">Ball & Stick</option>
          <option value="surface">Surface</option>
          <option value="spacefill">Spacefill</option>
        </select>
      </div>
      
      {/* ... other controls ... */}
    </div>
  );
}
