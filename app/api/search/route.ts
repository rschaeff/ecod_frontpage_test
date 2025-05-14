import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  // This is a mock implementation
  // In a real application, this would connect to a database or API
  const mockResults = {
    query,
    domains: [
      { 
        id: 'e4ubpA1', 
        range: 'A:1-185', 
        xname: 'TBP-like', 
        hname: 'TATA-binding protein-like', 
        tname: 'TATA-binding protein', 
        proteinName: 'TATA-box binding protein' 
      },
      { 
        id: 'e1ytbA1', 
        range: 'A:1-56', 
        xname: 'beta-Grasp', 
        hname: 'Ubiquitin-like', 
        tname: 'Ubiquitin-related', 
        proteinName: 'Ubiquitin-related modifier 1' 
      }
    ],
    clusters: [
      { id: '1.1.1.1', label: 'F', name: 'Ubiquitin-related' },
      { id: '2.1.1', label: 'H', name: 'TBP-like' }
    ],
    totalResults: 2
  };
  
  return NextResponse.json(mockResults);
}
