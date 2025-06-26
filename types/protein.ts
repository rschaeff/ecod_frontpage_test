// types/protein.ts - Updated with proper interfaces

export interface ProteinDomain {
  id: string;                    // e.g., "e2uubA1", "e2uubA2"
  range: string;                 // e.g., "159-252" (relative to this chain)
  rangeStart: number;            // Chain-relative start position
  rangeEnd: number;              // Chain-relative end position
  chainId: string;               // Explicit chain ID, e.g., "A"
  ecod: {
    architecture: string;        // e.g., "Alpha proteins"
    xgroup: string;              // e.g., "1.1" (no X. prefix)
    hgroup: string;              // e.g., "1.1.1" (no H. prefix)
    tgroup: string;              // e.g., "1.1.1.1" (no T. prefix)
    fgroup: string;              // e.g., "1.1.1.1.1" (no F. prefix)
  };
  color: string;
  description: string;
}

export interface ProteinChain {
  pdbId: string;                 // e.g., "2UUB"
  chainId: string;               // e.g., "A"
  id: string;                    // Combined: "2UUB_A"
  entityId?: number;             // PDB entity ID if available
  uniprotId?: string;            // UniProt accession if available
  name: string;                  // Protein name
  organism: string;              // Source organism
  length: number;                // ACTUAL chain length from sequence
  sequence: string;              // Full chain sequence
  domains: ProteinDomain[];      // Domains in this specific chain
  resolution?: string;           // From PDB entry
  method: string;                // Experimental method
  releaseDate: string;           // PDB release date
}

// Updated component props
export interface ProteinPageParams {
  params: {
    id: string;                  // Should be "2UUB_A" format or handle parsing
  };
}

// 3DMol viewer interface (fixing the missing reference)
export interface ThreeDMolDomain {
  id: string;
  chainId: string;
  start: number;
  end: number;
  color: string;
  label: string;
  classification: {
    t_group: string;
    h_group: string;
    x_group: string;
    a_group: string;
  };
}

// Viewer options for structure visualization
export interface ViewerOptions {
  style: 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill';
  showSideChains: boolean;
  showLigands: boolean;
  showLabels?: boolean;  // Optional for compatibility
  zoom?: number;         // Optional for compatibility
}

// Route parsing utility
export function parseProteinId(routeId: string): { pdbId: string; chainId: string } {
  // Handle formats like:
  // "2UUB_A" -> { pdbId: "2UUB", chainId: "A" }
  // "2UUB" -> { pdbId: "2UUB", chainId: "A" } (default to A)

  const parts = routeId.toUpperCase().split('_');

  if (parts.length === 2) {
    return {
      pdbId: parts[0],
      chainId: parts[1]
    };
  } else if (parts.length === 1 && parts[0].length >= 4) {
    // Could be "2UUBA" format or just "2UUB"
    const match = parts[0].match(/^([A-Z0-9]{4})([A-Z]?)$/);
    if (match) {
      return {
        pdbId: match[1],
        chainId: match[2] || 'A'  // Default to chain A
      };
    }
  }

  // Fallback
  return {
    pdbId: routeId.substring(0, 4).toUpperCase(),
    chainId: 'A'
  };
}

// Convert for 3DMol viewer
export function convertDomainFormat(domain: ProteinDomain): ThreeDMolDomain {
  return {
    id: domain.id,
    chainId: domain.chainId,
    start: domain.rangeStart,
    end: domain.rangeEnd,
    color: domain.color,
    label: domain.description,
    classification: {
      t_group: domain.ecod.tgroup,
      h_group: domain.ecod.hgroup,
      x_group: domain.ecod.xgroup,
      a_group: domain.ecod.architecture
    }
  };
}

// Example corrected data:
export const mockProteinData: ProteinChain = {
  pdbId: "2UUB",
  chainId: "A",
  id: "2UUB_A",
  entityId: 1,
  uniprotId: "P20226",
  name: "TATA-box-binding protein",
  organism: "Homo sapiens",
  length: 240,                   // ACTUAL chain A length, not domain end
  sequence: "MDQNNSLPPYAQGLASPQGAMTPGIPIFSPMMPYGTGLTPQPIQNTNSLSILEEQQRQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQAVAAAAVQQSTSQQATQGTSGQAPQLFHSQTLTTAPLPGTTPLYPSPMTPMTPITPATPASESSKVDNCSESYNEDNKTFPTEGIQTGAAAAAAAVSYLGYKFSVNQFCGVMNHDLNSKIILDRFSKEQSRLAARKYILGTTVKPHHRICQFKLGPKKFDENRNAVIPKSKIPEFLAQLTEDY",
  domains: [
    {
      id: "e2uubA1",
      range: "1-120",              // Relative to chain A
      rangeStart: 1,
      rangeEnd: 120,
      chainId: "A",
      ecod: {
        architecture: "Alpha proteins",
        xgroup: "1.1",             // NO prefixes
        hgroup: "1.1.1",           // NO prefixes
        tgroup: "1.1.1.1",         // NO prefixes
        fgroup: "1.1.1.1.1"        // NO prefixes
      },
      color: "#4285F4",
      description: "TATA-binding protein, N-terminal domain"
    },
    {
      id: "e2uubA2",
      range: "121-240",            // Relative to chain A
      rangeStart: 121,
      rangeEnd: 240,
      chainId: "A",
      ecod: {
        architecture: "Alpha proteins",
        xgroup: "1.1",
        hgroup: "1.1.1",
        tgroup: "1.1.1.1",
        fgroup: "1.1.1.1.2"        // Different F-group
      },
      color: "#EA4335",
      description: "TATA-binding protein, C-terminal domain"
    }
  ],
  resolution: "2.1Å",
  method: "X-ray diffraction",
  releaseDate: "2023-06-15"
};
