'use client';

import { Upload } from 'lucide-react';
import { useState } from 'react';

interface StructureUploaderProps {
  onFileUpload?: (file: File) => void;
}

/**
 * StructureUploader component allows users to upload alternative structure files
 */
export default function StructureUploader({ onFileUpload }: StructureUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  };
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Upload Alternative Structure</h3>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploadedFile ? (
          <div>
            <div className="text-blue-600 font-medium mb-1">{uploadedFile.name}</div>
            <div className="text-sm text-gray-500">
              {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type || 'Unknown type'}
            </div>
            <button 
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition"
              onClick={() => setUploadedFile(null)}
            >
              Replace File
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop a PDB or mmCIF file here
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition cursor-pointer inline-block">
              Browse Files
              <input 
                type="file" 
                className="hidden" 
                accept=".pdb,.cif,.mmcif,.ent" 
                onChange={handleFileChange}
              />
            </label>
          </>
        )}
      </div>
      
      {uploadedFile && (
        <div className="mt-3 text-center">
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded transition">
            Visualize Structure
          </button>
        </div>
      )}
    </div>
  );
}
