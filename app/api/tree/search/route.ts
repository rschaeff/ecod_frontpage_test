// app/api/tree/search/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * API route to search for classification nodes across the tree
 * GET /api/tree/search?q=globin - Search for nodes with "globin" in their name or ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q) {
      return NextResponse.json(
        { error: 'Search query parameter (q) is required' },
        { status: 400 }
      );
    }
    
    // Search for classification nodes that match the query
    const searchQuery = `
      SELECT id, name, type, parent, domain_number
      FROM public.cluster
      WHERE id ILIKE $1 OR name ILIKE $1
      ORDER BY 
        CASE 
          WHEN id ILIKE $2 THEN 0 
          WHEN name ILIKE $2 THEN 1
          ELSE 2
        END,
        id
      LIMIT 20
    `;
    
    const exactMatch = q;
    const searchResult = await query(searchQuery, [`%${q}%`, exactMatch]);
    
    // Format response
    const response = {
      query: q,
      results: searchResult.rows.map(node => ({
        id: node.id,
        name: node.name,
        level: node.type,
        parent: node.parent,
        domainCount: node.domain_number
      }))
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching tree:', error);
    return NextResponse.json(
      { error: 'Failed to perform tree search' },
      { status: 500 }
    );
  }
}
