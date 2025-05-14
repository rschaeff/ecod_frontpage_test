// types/protein.ts
export interface ProteinDomain {
  id: string;         // Domain ID (e.g., e4ubpA1)
  range: string;      // Residue range (e.g., '1-150')
  rangeStart: number; // Numeric start of range
  rangeEnd: number;   // Numeric end of range
  ecod: {             // ECOD classification
    xgroup: string;   // X-group (possible homology)
    hgroup: string;   // H-group (homology)
    tgroup: string;   // T-group (topology)
    fgroup: string;   // F-group (family)
  };
  color: string;      // Color for visualization
  description: string; // Domain description/name
}

export interface ProteinData {
  id: string;          // Protein ID (e.g., PDB ID)
  uniprotId: string;   // UniProt accession
  name: string;        // Protein name
  organism: string;    // Source organism
  length: number;      // Sequence length
  sequence: string;    // Full amino acid sequence
  domains: ProteinDomain[]; // Array of domains in the protein
  resolution: string;  // Structure resolution (if applicable)
  method: string;      // Experimental method
  releaseDate: string; // Structure release date
}

export interface ViewerOptions {
  style: 'cartoon' | 'surface' | 'ball-and-stick';
  showLabels: boolean;
  showSideChains: boolean;
  zoom: number;
}
