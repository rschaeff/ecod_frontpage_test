// app/api/tree/search/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * API route to search for classification nodes across the tree
 * GET /api/tree/search?q=globin - Search for nodes with "globin" in their name or ID
 */
// app/api/tree/search/route.ts - Simplified version without confusing suggestions

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const includeNodes = searchParams.get('includeNodes') !== 'false';
    const includeDomains = searchParams.get('includeDomains') !== 'false';

    if (!q) {
      return NextResponse.json(
        { error: 'Search query parameter (q) is required' },
        { status: 400 }
      );
    }

    const results: any = {
      query: q,
      nodes: [],
      domains: []
    };

    // 1. Search classification nodes - using same logic as main search
    if (includeNodes) {
      const nodeSearchQuery = `
        SELECT
          id,
          name,
          type,
          parent,
          domain_number,
          -- Same relevance scoring as main search for consistency
          (CASE
            WHEN LOWER(id) = LOWER($1) THEN 100        -- Exact ID match
            WHEN LOWER(name) = LOWER($1) THEN 95       -- Exact name match
            WHEN LOWER(id) LIKE LOWER($2) THEN 90      -- ID contains query
            WHEN LOWER(name) LIKE LOWER($2) THEN 85    -- Name contains query
            ELSE 50                                    -- General match
          END) as relevance_score
        FROM public.cluster
        WHERE
          LOWER(id) ILIKE LOWER($2)
          OR LOWER(name) ILIKE LOWER($2)
        ORDER BY
          relevance_score DESC,
          CASE type
            WHEN 'A' THEN 1
            WHEN 'X' THEN 2
            WHEN 'H' THEN 3
            WHEN 'T' THEN 4
            WHEN 'F' THEN 5
            ELSE 6
          END,
          id
        LIMIT 15
      `;

      const nodeResult = await query(nodeSearchQuery, [q, `%${q}%`]);
      results.nodes = nodeResult.rows.map(node => ({
        id: node.id,
        name: node.name,
        level: node.type,
        parent: node.parent,
        domainCount: node.domain_number,
        relevanceScore: node.relevance_score
      }));
    }

    // 2. Search domains - using same logic as main search
    if (includeDomains) {
      const domainSearchQuery = `
        (SELECT
          id,
          range,
          fname as name,
          fid as classification_id,
          'F' as classification_level,
          'pdb' as source_type,
          (CASE
            WHEN LOWER(id) = LOWER($1) THEN 100
            WHEN LOWER(fname) = LOWER($1) THEN 95
            WHEN LOWER(id) LIKE LOWER($2) THEN 90
            WHEN LOWER(fname) LIKE LOWER($2) THEN 85
            ELSE 50
          END) as relevance_score
        FROM public.view_dom_clsrel_pdbinfo
        WHERE
          LOWER(id) ILIKE LOWER($2)
          OR LOWER(fname) ILIKE LOWER($2)
        LIMIT 8)

        UNION ALL

        (SELECT
          id,
          range,
          fname as name,
          fid as classification_id,
          'F' as classification_level,
          'csm' as source_type,
          (CASE
            WHEN LOWER(id) = LOWER($1) THEN 100
            WHEN LOWER(fname) = LOWER($1) THEN 95
            WHEN LOWER(id) LIKE LOWER($2) THEN 90
            WHEN LOWER(fname) LIKE LOWER($2) THEN 85
            ELSE 50
          END) as relevance_score
        FROM public.view_dom_clsrel_csminfo
        WHERE
          LOWER(id) ILIKE LOWER($2)
          OR LOWER(fname) ILIKE LOWER($2)
        LIMIT 8)

        ORDER BY relevance_score DESC, id
        LIMIT 15
      `;

      const domainResult = await query(domainSearchQuery, [q, `%${q}%`]);
      results.domains = domainResult.rows.map(domain => ({
        id: domain.id,
        range: domain.range,
        name: domain.name,
        classificationId: domain.classification_id,
        classificationLevel: domain.classification_level,
        sourceType: domain.source_type,
        relevanceScore: domain.relevance_score
      }));
    }

    // Add search metadata
    results.resultCount = results.nodes.length + results.domains.length;
    results.hasResults = results.resultCount > 0;

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error in tree search:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform tree search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
