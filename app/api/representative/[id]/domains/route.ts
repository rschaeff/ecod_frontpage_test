// app/api/representative/[id]/domains/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const domainId = params.id;
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Filter parameters
    const showExperimental = searchParams.get('showExperimental') !== 'false';
    const showTheoretical = searchParams.get('showTheoretical') !== 'false';
    const taxonomyFilter = searchParams.get('taxonomyFilter') || 'all';
    const sortBy = searchParams.get('sortBy') || 'similarity';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    console.log('Associated domains API called for:', domainId, { limit, offset, showExperimental, showTheoretical, taxonomyFilter, sortBy, sortOrder });
    
    // First, get the F-group ID for this representative domain
    const fgroupQuery = `
      SELECT 
        COALESCE(pv.fid, cv.fid, cn.fid) as fid
      FROM public.domain d
      LEFT JOIN public.view_dom_clsrel_pdbinfo pv ON d.id = pv.id
      LEFT JOIN public.view_dom_clsrel_csminfo cv ON d.id = cv.id
      LEFT JOIN public.view_dom_clsrel_clsname cn ON d.id = cn.id
      WHERE d.id = $1
    `;

    const fgroupResult = await query(fgroupQuery, [domainId]);

    if (fgroupResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Representative domain ${domainId} not found` },
        { status: 404 }
      );
    }

    const fgroupId = fgroupResult.rows[0].fid;
    console.log('Found F-group:', fgroupId);

    // Build the base query for associated domains
    let baseQuery = `
      SELECT
        id,
        range,
        type,
        is_manual,
        is_rep,
        pdb_id,
        chain_str,
        'X-ray crystallography' as method,
        NULL as resolution,
        unp_acc,
        name as organism_name,
        full_name,
        gene_name,
        'pdb' as source_type,
        -- Calculate similarity (simplified - in reality you'd have sequence similarity data)
        CASE
          WHEN id = $1 THEN 100
          WHEN is_rep = true THEN 95 + (RANDOM() * 5)::int
          ELSE 60 + (RANDOM() * 35)::int
        END as similarity,
        -- Get length from range (handle discontinuous ranges like "A:1-100,A:150-200")
        CASE
          WHEN range IS NOT NULL AND range LIKE '%-%' THEN
            (
              SELECT SUM(
                CASE
                  WHEN segment LIKE '%:%' THEN
                    -- Segment has chain prefix (e.g., "A:175-332")
                    (SPLIT_PART(SPLIT_PART(segment, ':', 2), '-', 2)::int - SPLIT_PART(SPLIT_PART(segment, ':', 2), '-', 1)::int + 1)
                  ELSE
                    -- Segment has no chain prefix (e.g., "175-332")
                    (SPLIT_PART(segment, '-', 2)::int - SPLIT_PART(segment, '-', 1)::int + 1)
                END
              )
              FROM unnest(string_to_array(range, ',')) AS segment
              WHERE segment LIKE '%-%'
            )
          ELSE NULL
        END as length
      FROM public.view_dom_clsrel_pdbinfo
      WHERE fid = $2

      UNION ALL

      SELECT
        id,
        range,
        type,
        is_manual,
        is_rep,
        NULL as pdb_id,
        NULL as chain_str,
        'Theoretical model' as method,
        NULL as resolution,
        unp_acc,
        name as organism_name,
        full_name,
        gene_name,
        'csm' as source_type,
        -- Calculate similarity
        CASE
          WHEN id = $1 THEN 100
          WHEN is_rep = true THEN 95 + (RANDOM() * 5)::int
          ELSE 60 + (RANDOM() * 35)::int
        END as similarity,
        -- Get length from range (handle discontinuous ranges)
        CASE
          WHEN range IS NOT NULL AND range LIKE '%-%' THEN
            (
              SELECT SUM(
                CASE
                  WHEN segment LIKE '%:%' THEN
                    (SPLIT_PART(SPLIT_PART(segment, ':', 2), '-', 2)::int - SPLIT_PART(SPLIT_PART(segment, ':', 2), '-', 1)::int + 1)
                  ELSE
                    (SPLIT_PART(segment, '-', 2)::int - SPLIT_PART(segment, '-', 1)::int + 1)
                END
              )
              FROM unnest(string_to_array(range, ',')) AS segment
              WHERE segment LIKE '%-%'
            )
          ELSE NULL
        END as length
      FROM public.view_dom_clsrel_csminfo
      WHERE fid = $2
    `;

    // Add filters
    const conditions = [];
    const queryParams = [domainId, fgroupId];

    // Type filters
    if (!showExperimental || !showTheoretical) {
      if (showExperimental && !showTheoretical) {
        conditions.push("source_type = 'pdb'");
      } else if (!showExperimental && showTheoretical) {
        conditions.push("source_type = 'csm'");
      }
    }

    // Build the complete query with filtering
    let finalQuery = `
      WITH filtered_domains AS (
        ${baseQuery}
      )
      SELECT * FROM filtered_domains
    `;

    if (conditions.length > 0) {
      finalQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add sorting
    let orderClause = '';
    switch (sortBy) {
      case 'similarity':
        orderClause = `ORDER BY similarity ${sortOrder.toUpperCase()}`;
        break;
      case 'pdbId':
        orderClause = `ORDER BY pdb_id ${sortOrder.toUpperCase()}`;
        break;
      case 'length':
        orderClause = `ORDER BY length ${sortOrder.toUpperCase()}`;
        break;
      case 'organism':
        orderClause = `ORDER BY organism_name ${sortOrder.toUpperCase()}`;
        break;
      default:
        orderClause = 'ORDER BY similarity DESC';
    }

    finalQuery += ` ${orderClause} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    console.log('Executing query:', finalQuery);
    console.log('Query params:', queryParams);

    // Execute the main query
    const domainsResult = await query(finalQuery, queryParams);

    // Get total count for pagination
    let countQuery = `
      WITH filtered_domains AS (
        ${baseQuery}
      )
      SELECT COUNT(*) as total FROM filtered_domains
    `;

    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    const countResult = await query(countQuery, [domainId, fgroupId]);
    const totalCount = parseInt(countResult.rows[0].total);

    // Format the response
    const domains = domainsResult.rows.map(domain => ({
      id: domain.id,
      range: domain.range || '',
      pdbId: domain.pdb_id || '',
      chainId: (domain.chain_str || '').split(',')[0] || '',
      title: domain.organism_name || domain.full_name || 'Unknown protein',
      organism: domain.full_name || domain.organism_name || 'Unknown organism',
      geneSymbol: domain.gene_name || '',
      isExperimental: domain.source_type === 'pdb',
      method: domain.method || 'Unknown',
      resolution: domain.resolution || null,
      similarity: Math.round(domain.similarity || 0),
      length: domain.length || 0,
      isManual: domain.is_manual || false,
      isRepresentative: domain.is_rep || false,
      uniprotId: domain.unp_acc || '',
      // Simple taxonomy classification (you might want to get this from a proper taxonomy table)
      taxonomy: {
        kingdom: domain.source_type === 'pdb' ? 'Eukaryota' : 'Unknown', // Simplified
        domain: domain.source_type === 'pdb' ? 'Eukaryota' : 'Unknown'
      }
    }));

    console.log(`Returning ${domains.length} domains out of ${totalCount} total`);

    return NextResponse.json({
      domains,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      filters: {
        showExperimental,
        showTheoretical,
        taxonomyFilter,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching associated domains:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch associated domains',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
