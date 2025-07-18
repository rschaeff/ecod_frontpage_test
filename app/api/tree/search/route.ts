// app/api/tree/search/route.ts - Fixed complete implementation

import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Use NextRequest.nextUrl.searchParams instead of request.url
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get('q')
    const type = searchParams.get('type')

    console.log('Search query:', searchQuery, 'type:', type)

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'Search query parameter (q) is required' },
        { status: 400 }
      );
    }

    // Search classification nodes - focused on tree browsing
    const sqlQuery = `
      SELECT
        id,
        name,
        type,
        parent,
        domain_number
      FROM public.cluster
      WHERE
        LOWER(id) ILIKE LOWER($1)
        OR LOWER(name) ILIKE LOWER($1)
      ORDER BY
        CASE
          WHEN LOWER(id) = LOWER($2) THEN 1      -- Exact match first
          WHEN LOWER(id) LIKE LOWER($3) THEN 2   -- Starts with query
          WHEN LOWER(name) LIKE LOWER($3) THEN 3 -- Name starts with query
          ELSE 4                                 -- Contains query
        END,
        CASE type
          WHEN 'A' THEN 1
          WHEN 'X' THEN 2
          WHEN 'H' THEN 3
          WHEN 'T' THEN 4
          WHEN 'F' THEN 5
          ELSE 6
        END,
        id
      LIMIT 20
    `;

    const searchPattern = `%${searchQuery}%`;
    const prefixPattern = `${searchQuery}%`;

    const searchResult = await dbQuery(sqlQuery, [searchPattern, searchQuery, prefixPattern]);

    // Return in the format the frontend expects
    const results = {
      query: searchQuery,
      results: searchResult.rows.map(node => ({
        id: node.id,
        name: node.name,
        level: node.type,
        parent: node.parent,
        domainCount: node.domain_number || 0
      }))
    };

    return NextResponse.json(results);

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
