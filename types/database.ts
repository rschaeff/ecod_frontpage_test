// types/database.ts - Comprehensive database entity types for ECOD

// Core database table interfaces
export interface ClusterRow {
  id: string;
  name: string;
  parent: string | null;
  type: 'A' | 'X' | 'H' | 'T' | 'F';
  domain_number: number | null;
  is_obsolete?: boolean;
}

export interface DomainRow {
  id: string;
  uid: string;
  range: string | null;
  type: string;
  is_manual: boolean;
  is_rep: boolean;
  is_obsolete?: boolean;
}

// View interfaces for classification-related domain info
export interface DomainClassificationPDBInfo {
  id: string;
  uid: string;
  range: string | null;
  type: string;
  is_manual: boolean;
  is_rep: boolean;
  pdb_id: string;
  chain_str: string | null;
  method: string | null;
  resolution: number | null;
  is_obsolete: boolean | null;
  unp_acc: string | null;
  name: string | null;
  full_name: string | null;
  gene_name: string | null;
  aid: string;
  aname: string;
  xid: string;
  xname: string;
  hid: string;
  hname: string;
  tid: string;
  tname: string;
  fid: string;
  fname: string;
  pfam_acc: string | null;
  clan_acc: string | null;
  drugbank_acc: string | null;
  drugdomain_link: string | null;
  comment: string | null;
  start_index: number | null;
  end_index: number | null;
}

export interface DomainClassificationCSMInfo {
  id: string;
  uid: string;
  range: string | null;
  type: string;
  is_manual: boolean;
  is_rep: boolean;
  source_id: string;
  unp_acc: string | null;
  name: string | null;
  full_name: string | null;
  gene_name: string | null;
  aid: string;
  aname: string;
  xid: string;
  xname: string;
  hid: string;
  hname: string;
  tid: string;
  tname: string;
  fid: string;
  fname: string;
  pfam_acc: string | null;
  comment: string | null;
}

// API response interfaces
export interface ClassificationNode {
  id: string;
  name: string;
  level: string;
  parent: string | null;
  domainCount: number;
}

export interface ClassificationChild {
  id: string;
  name: string;
  level: string;
  domainCount: number;
}

export interface ClassificationRepresentative {
  id: string;
  range: string;
  pdb_id: string | null;
  chain: string | null;
  uniprot: string;
  isManual: boolean;
}

export interface ClassificationResponse {
  id: string;
  name: string;
  level: string;
  parent: string | null;
  domainCount: number;
  children: ClassificationChild[];
  representatives: ClassificationRepresentative[];
}

// Search result interfaces
export interface SearchDomainResult {
  id: string;
  range: string;
  xname: string;
  hname: string;
  tname: string;
  proteinName: string;
  sourceType: 'pdb' | 'csm';
  relevanceScore?: number;
  isRepresentative?: boolean;
  isManual?: boolean;
  domainLength?: number | null;
}

export interface SearchClusterResult {
  id: string;
  label: string;
  name: string;
  type: string;
  relevanceScore?: number;
}

export interface SearchResponse {
  query: string;
  searchType: string;
  domains: SearchDomainResult[];
  clusters: SearchClusterResult[];
  totalResults: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  };
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

// Tree/hierarchy interfaces
export interface TreeNode {
  id: string;
  name: string;
  level: string;
  domainCount: number;
}

export interface TreeResponse {
  level: string;
  parent: string | null;
  nodes: TreeNode[];
}

// Representative domain interfaces
export interface RepresentativeDomain {
  id: string;
  title: string;
  range: string;
  structureId: string;
  chainId: string;
  method: string;
  resolution: number | null;
  length: number;
  sequence: string;
  classification: {
    architecture: string;
    xgroup: { id: string; name: string };
    hgroup: { id: string; name: string };
    tgroup: { id: string; name: string };
    fgroup: { id: string; name: string };
  };
  organism: string;
  uniprotId: string | null;
  pfamAccession: string | null;
  curation: {
    notes: string;
    curator: string;
    date: string;
  };
  isManual: boolean;
  isRepresentative: boolean;
}

// Associated domains for representative
export interface AssociatedDomain {
  id: string;
  range: string;
  pdbId: string;
  chainId: string;
  title: string;
  organism: string;
  geneSymbol: string;
  isExperimental: boolean;
  method: string;
  resolution: number | null;
  similarity: number;
  length: number;
  isManual: boolean;
  isRepresentative: boolean;
  uniprotId: string;
  taxonomy: {
    kingdom: string;
    domain: string;
  };
}

export interface AssociatedDomainsResponse {
  domains: AssociatedDomain[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    showExperimental: boolean;
    showTheoretical: boolean;
    taxonomyFilter: string;
    sortBy: string;
    sortOrder: string;
  };
}

// Statistics interfaces
export interface LengthDistributionBin {
  range: string;
  count: number;
}

export interface TaxonomyNode {
  name: string;
  count: number;
  children?: TaxonomyNode[];
}

export interface RepresentativeStats {
  experimentalDistribution: {
    experimental: number;
    theoretical: number;
    total: number;
  };
  lengthDistribution: {
    min: number;
    max: number;
    mean: number;
    median: number;
    bins: LengthDistributionBin[];
  };
  taxonomyDistribution: TaxonomyNode[];
}

// Database query result helper type
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Utility types for common patterns
export type ClassificationLevel = 'A' | 'X' | 'H' | 'T' | 'F';
export type SourceType = 'pdb' | 'csm';

// Export interfaces that might be used in API routes
export type { 
  ClusterRow as DatabaseCluster,
  DomainRow as DatabaseDomain,
  DomainClassificationPDBInfo as PDBDomainInfo,
  DomainClassificationCSMInfo as CSMDomainInfo
};
