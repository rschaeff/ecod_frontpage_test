export interface ProteinDomain {
  id: string;
  range: string;
  rangeStart: number;
  rangeEnd: number;
  ecod: {
    xgroup: string;
    hgroup: string;
    tgroup: string;
    fgroup: string;
  };
  color: string;
  description: string;
}

export interface ProteinData {
  id: string;
  uniprotId: string;
  name: string;
  organism: string;
  length: number;
  sequence: string;
  domains: ProteinDomain[];
  resolution: string;
  method: string;
  releaseDate: string;
}

export interface ViewerOptions {
  style: 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill';
  colorScheme?: 'chain' | 'secondary-structure' | 'residue-type' | 'hydrophobicity';
  showSideChains: boolean;
  showLigands: boolean;
  showWater?: boolean;
  quality?: 'low' | 'medium' | 'high';
  showLabels: boolean;
  zoom: number;
}

// Domain format for 3DMol viewer
export interface ThreeDMolDomain {
  id: string;
  chainId: string;
  start: number;
  end: number;
  color: string;
  label?: string;
  pdb_range?: string;
  pdb_start?: string;
  pdb_end?: string;
  classification?: {
    t_group?: string;
    h_group?: string;
    x_group?: string;
    a_group?: string;
  };
}

// Convert ProteinDomain to ThreeDMolDomain
export function convertDomainFormat(domain: ProteinDomain, chainId: string = 'A'): ThreeDMolDomain {
  return {
    id: domain.id,
    chainId: chainId,
    start: domain.rangeStart,
    end: domain.rangeEnd,
    color: domain.color,
    label: domain.description,
    classification: {
      t_group: domain.ecod.tgroup,
      h_group: domain.ecod.hgroup,
      x_group: domain.ecod.xgroup,
      a_group: domain.ecod.fgroup // Architecture level
    }
  };
}
