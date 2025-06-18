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
    const includeNodes = searchParams.get('includeNodes') !== 'false'; // NEW
    const includeDomains = searchParams.get('includeDomains') !== 'false'; // NEW

    if (!q) {
      return NextResponse.json(
        { error: 'Search query parameter (q) is required' },
        { status: 400 }
      );
    }

    const results: any = {
      query: q,
      nodes: [],
      domains: [],
      suggestions: []
    };

    // 1. Search classification nodes (existing + enhanced)
    if (includeNodes) {
      const nodeSearchQuery = `
        SELECT
          id,
          name,
          type,
          parent,
          domain_number,
          -- Relevance scoring for nodes
          (CASE
            WHEN id ILIKE $1 THEN 100        -- Exact ID match
            WHEN name ILIKE $2 THEN 90       -- Exact name match
            WHEN name ILIKE $1 THEN 80       -- Name contains query
            ELSE 50                          -- General match
          END) as relevance_score
        FROM public.cluster
        WHERE
          id ILIKE $1
          OR name ILIKE $1
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
        LIMIT 10
      `;

      const nodeResult = await query(nodeSearchQuery, [`%${q}%`, q]);
      results.nodes = nodeResult.rows.map(node => ({
        id: node.id,
        name: node.name,
        level: node.type,
        parent: node.parent,
        domainCount: node.domain_number,
        relevanceScore: node.relevance_score
      }));
    }

    // 2. Search domains that match the query (NEW)
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
            WHEN id ILIKE $1 THEN 100
            WHEN fname ILIKE $2 THEN 90
            WHEN fname ILIKE $1 THEN 80
            ELSE 50
          END) as relevance_score
        FROM public.view_dom_clsrel_pdbinfo
        WHERE
          id ILIKE $1
          OR fname ILIKE $1
        LIMIT 5)

        UNION ALL

        (SELECT
          id,
          range,
          fname as name,
          fid as classification_id,
          'F' as classification_level,
          'csm' as source_type,
          (CASE
            WHEN id ILIKE $1 THEN 100
            WHEN fname ILIKE $2 THEN 90
            WHEN fname ILIKE $1 THEN 80
            ELSE 50
          END) as relevance_score
        FROM public.view_dom_clsrel_csminfo
        WHERE
          id ILIKE $1
          OR fname ILIKE $1
        LIMIT 5)

        ORDER BY relevance_score DESC, id
        LIMIT 10
      `;

      const domainResult = await query(domainSearchQuery, [`%${q}%`, q]);
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

    // 3. Generate search suggestions (NEW)
    if (results.nodes.length === 0 && results.domains.length === 0) {
      const suggestionQuery = `
        SELECT DISTINCT name, type, id
        FROM public.cluster
        WHERE name ILIKE $1
        ORDER BY
          CASE type
            WHEN 'F' THEN 1
            WHEN 'T' THEN 2
            WHEN 'H' THEN 3
            WHEN 'X' THEN 4
            WHEN 'A' THEN 5
          END,
          name
        LIMIT 5
      `;

      const suggestionResult = await query(suggestionQuery, [`%${q.split('').join('%')}%`]);
      results.suggestions = suggestionResult.rows.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type
      }));
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in enhanced tree search:', error);
    return NextResponse.json(
      { error: 'Failed to perform tree search' },
      { status: 500 }
    );
  }
}
