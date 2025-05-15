// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export const ECOD = {
  // Fetch domain data
  async getDomain(id: string) {
    const response = await fetch(`${API_BASE}/api/domains/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch domain: ${response.statusText}`);
    return response.json();
  },
  
  // Fetch protein/chain data
  async getProtein(id: string) {
    const response = await fetch(`${API_BASE}/api/proteins/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch protein: ${response.statusText}`);
    return response.json();
  },
  
  // Search the database
  async search(params: {q?: string, pdb?: string, unp_acc?: string, limit?: number, offset?: number}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    const response = await fetch(`${API_BASE}/api/search?${queryParams}`);
    if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
    return response.json();
  },
  
  // Get classification data
  async getClassification(id: string) {
    const response = await fetch(`${API_BASE}/api/classification/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch classification: ${response.statusText}`);
    return response.json();
  },
  
  // Get structure file URL
  getStructureUrl(id: string) {
    return `${API_BASE}/api/structures/${id}`;
  },
  
  // Get sequence data
  async getSequence(id: string, format: 'json' | 'fasta' = 'json') {
    const response = await fetch(`${API_BASE}/api/sequences/${id}?format=${format}`);
    if (!response.ok) throw new Error(`Failed to fetch sequence: ${response.statusText}`);
    return format === 'json' ? response.json() : response.text();
  },
  
  // Get database stats
  async getStats() {
    const response = await fetch(`${API_BASE}/api/stats`);
    if (!response.ok) throw new Error(`Failed to fetch stats: ${response.statusText}`);
    return response.json();
  }
};
