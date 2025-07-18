// app/api/tree/search/route.ts - Compatible with existing frontend

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic  '

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

    // Search classification nodes - focused on tree browsing
    const searchQuery = `
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

    const searchPattern = `%${q}%`;
    const prefixPattern = `${q}%`;

    const searchResult = await query(searchQuery, [searchPattern, q, prefixPattern]);

    // Return in the format the frontend expects
    const results = {
      query: q,
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
    console.error('Tree search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform tree search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
