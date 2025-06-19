// app/api/search/route.ts - FIXED VERSION
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const pdbId = searchParams.get('pdb');
    const unpAcc = searchParams.get('unp_acc');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate input parameters
    if (!q && !pdbId && !unpAcc) {
      return NextResponse.json(
        { error: 'No search criteria provided. Use q, pdb, or unp_acc parameters.' },
        { status: 400 }
      );
    }

    if (limit > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100 results per request.' },
        { status: 400 }
      );
    }

    let searchQuery, totalCountQuery, searchParams_arr, countParams_arr;
    let clusterQuery, clusterParams;

    if (q) {
      // General keyword search across domain IDs and classification names
      const searchPattern = `%${q}%`;
      const exactMatch = q;

      searchQuery = `
        (SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'pdb' AS source_type,
          -- Relevance scoring for better ordering
          (CASE
            WHEN LOWER(id) = LOWER($1) THEN 100          -- Exact ID match gets highest score
            WHEN LOWER(id) LIKE LOWER($2) THEN 95        -- ID contains query
            WHEN LOWER(fname) = LOWER($1) THEN 90        -- Exact F-group name match
            WHEN LOWER(fname) LIKE LOWER($2) THEN 85     -- F-group name contains query
            WHEN LOWER(tname) = LOWER($1) THEN 80        -- Exact T-group name match
            WHEN LOWER(tname) LIKE LOWER($2) THEN 75     -- T-group name contains query
            WHEN LOWER(hname) = LOWER($1) THEN 70        -- Exact H-group name match
            WHEN LOWER(hname) LIKE LOWER($2) THEN 65     -- H-group name contains query
            WHEN LOWER(xname) = LOWER($1) THEN 60        -- Exact X-group name match
            WHEN LOWER(xname) LIKE LOWER($2) THEN 55     -- X-group name contains query
            ELSE 50                                      -- General match
          END) as relevance_score,
          -- Add useful sorting fields
          CASE WHEN is_rep = true THEN 1 ELSE 0 END as is_representative,
          CASE WHEN is_manual = true THEN 1 ELSE 0 END as is_manual,
          CASE
            WHEN range IS NOT NULL AND range LIKE '%-%'
            THEN (SPLIT_PART(range, '-', 2)::int - SPLIT_PART(range, '-', 1)::int + 1)
            ELSE NULL
          END as domain_length,
          xid, hid, tid, fid  -- For classification sorting
        FROM
          public.view_dom_clsrel_pdbinfo
        WHERE
          LOWER(id) ILIKE LOWER($2)
          OR LOWER(xname) ILIKE LOWER($2)
          OR LOWER(hname) ILIKE LOWER($2)
          OR LOWER(tname) ILIKE LOWER($2)
          OR LOWER(fname) ILIKE LOWER($2))

        UNION ALL

        (SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'csm' AS source_type,
          (CASE
            WHEN LOWER(id) = LOWER($1) THEN 100
            WHEN LOWER(id) LIKE LOWER($2) THEN 95
            WHEN LOWER(fname) = LOWER($1) THEN 90
            WHEN LOWER(fname) LIKE LOWER($2) THEN 85
            WHEN LOWER(tname) = LOWER($1) THEN 80
            WHEN LOWER(tname) LIKE LOWER($2) THEN 75
            WHEN LOWER(hname) = LOWER($1) THEN 70
            WHEN LOWER(hname) LIKE LOWER($2) THEN 65
            WHEN LOWER(xname) = LOWER($1) THEN 60
            WHEN LOWER(xname) LIKE LOWER($2) THEN 55
            ELSE 50
          END) as relevance_score,
          CASE WHEN is_rep = true THEN 1 ELSE 0 END as is_representative,
          CASE WHEN is_manual = true THEN 1 ELSE 0 END as is_manual,
          CASE
            WHEN range IS NOT NULL AND range LIKE '%-%'
            THEN (SPLIT_PART(range, '-', 2)::int - SPLIT_PART(range, '-', 1)::int + 1)
            ELSE NULL
          END as domain_length,
          xid, hid, tid, fid
        FROM
          public.view_dom_clsrel_csminfo
        WHERE
          LOWER(id) ILIKE LOWER($2)
          OR LOWER(xname) ILIKE LOWER($2)
          OR LOWER(hname) ILIKE LOWER($2)
          OR LOWER(tname) ILIKE LOWER($2)
          OR LOWER(fname) ILIKE LOWER($2))

        -- Smart ordering based on sort parameter
        ORDER BY
          ${getSortClause(sortBy, sortOrder)}
        LIMIT $3 OFFSET $4
      `;

      // FIXED: Count query uses only the search pattern parameter
      totalCountQuery = `
        SELECT
          (SELECT COUNT(*) FROM public.view_dom_clsrel_pdbinfo
           WHERE LOWER(id) ILIKE LOWER($1) OR LOWER(xname) ILIKE LOWER($1) OR LOWER(hname) ILIKE LOWER($1) OR LOWER(tname) ILIKE LOWER($1) OR LOWER(fname) ILIKE LOWER($1)) +
          (SELECT COUNT(*) FROM public.view_dom_clsrel_csminfo
           WHERE LOWER(id) ILIKE LOWER($1) OR LOWER(xname) ILIKE LOWER($1) OR LOWER(hname) ILIKE LOWER($1) OR LOWER(tname) ILIKE LOWER($1) OR LOWER(fname) ILIKE LOWER($1))
        AS total
      `;

      // FIXED: Separate parameter arrays for search and count queries
      searchParams_arr = [exactMatch, searchPattern, limit, offset];
      countParams_arr = [searchPattern]; // Only search pattern for count

      // Cluster search for keyword queries
      clusterQuery = `
        SELECT DISTINCT
          id,
          SUBSTRING(id, 1, 1) AS label,
          name,
          type,
          (CASE
            WHEN LOWER(id) = LOWER($1) THEN 100
            WHEN LOWER(id) LIKE LOWER($2) THEN 90
            WHEN LOWER(name) = LOWER($1) THEN 85
            WHEN LOWER(name) LIKE LOWER($2) THEN 80
            ELSE 50
          END) as relevance_score,
          (CASE type
            WHEN 'A' THEN 1
            WHEN 'X' THEN 2
            WHEN 'H' THEN 3
            WHEN 'T' THEN 4
            WHEN 'F' THEN 5
            ELSE 6
          END) as type_order
        FROM
          public.cluster
        WHERE
          LOWER(name) ILIKE LOWER($2) OR LOWER(id) ILIKE LOWER($2)
        ORDER BY
          relevance_score DESC,
          type_order,
          id
        LIMIT 20
      `;
      clusterParams = [exactMatch, searchPattern];

    } else if (pdbId) {
      // Search by PDB ID - case insensitive, normalize to lowercase
      const normalizedPdbId = pdbId.toLowerCase();

      searchQuery = `
        SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'pdb' AS source_type,
          100 as relevance_score,  -- All PDB matches are equally relevant
          CASE WHEN is_rep = true THEN 1 ELSE 0 END as is_representative,
          CASE WHEN is_manual = true THEN 1 ELSE 0 END as is_manual,
          CASE
            WHEN range IS NOT NULL AND range LIKE '%-%'
            THEN (SPLIT_PART(range, '-', 2)::int - SPLIT_PART(range, '-', 1)::int + 1)
            ELSE NULL
          END as domain_length,
          xid, hid, tid, fid
        FROM
          public.view_dom_clsrel_pdbinfo
        WHERE
          LOWER(pdb_id) = LOWER($1)
        ORDER BY
          ${getSortClause(sortBy, sortOrder)}
        LIMIT $2 OFFSET $3
      `;

      totalCountQuery = `
        SELECT COUNT(*) AS total
        FROM public.view_dom_clsrel_pdbinfo
        WHERE LOWER(pdb_id) = LOWER($1)
      `;

      searchParams_arr = [normalizedPdbId, limit, offset];
      countParams_arr = [normalizedPdbId]; // FIXED: Only PDB ID for count

      // Cluster search for PDB queries
      clusterQuery = `
        SELECT DISTINCT
          c.id,
          SUBSTRING(c.id, 1, 1) AS label,
          c.name,
          c.type,
          100 as relevance_score,
          (CASE c.type
            WHEN 'A' THEN 1
            WHEN 'X' THEN 2
            WHEN 'H' THEN 3
            WHEN 'T' THEN 4
            WHEN 'F' THEN 5
            ELSE 6
          END) as type_order
        FROM
          public.cluster c
        JOIN
          public.view_dom_clsrel_pdbinfo v ON (
            c.id = v.fid OR c.id = v.tid OR c.id = v.hid OR c.id = v.xid
          )
        WHERE
          LOWER(v.pdb_id) = LOWER($1)
        ORDER BY
          type_order,
          c.id
        LIMIT 20
      `;
      clusterParams = [normalizedPdbId];

    } else if (unpAcc) {
      // Search by UniProt accession
      searchQuery = `
        (SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'pdb' AS source_type,
          100 as relevance_score,
          CASE WHEN is_rep = true THEN 1 ELSE 0 END as is_representative,
          CASE WHEN is_manual = true THEN 1 ELSE 0 END as is_manual,
          CASE
            WHEN range IS NOT NULL AND range LIKE '%-%'
            THEN (SPLIT_PART(range, '-', 2)::int - SPLIT_PART(range, '-', 1)::int + 1)
            ELSE NULL
          END as domain_length,
          xid, hid, tid, fid
        FROM
          public.view_dom_clsrel_pdbinfo
        WHERE
          unp_acc = $1)

        UNION ALL

        (SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'csm' AS source_type,
          100 as relevance_score,
          CASE WHEN is_rep = true THEN 1 ELSE 0 END as is_representative,
          CASE WHEN is_manual = true THEN 1 ELSE 0 END as is_manual,
          CASE
            WHEN range IS NOT NULL AND range LIKE '%-%'
            THEN (SPLIT_PART(range, '-', 2)::int - SPLIT_PART(range, '-', 1)::int + 1)
            ELSE NULL
          END as domain_length,
          xid, hid, tid, fid
        FROM
          public.view_dom_clsrel_csminfo
        WHERE
          unp_acc = $1)

        ORDER BY
          ${getSortClause(sortBy, sortOrder)}
        LIMIT $2 OFFSET $3
      `;

      totalCountQuery = `
        SELECT
          (SELECT COUNT(*) FROM public.view_dom_clsrel_pdbinfo WHERE unp_acc = $1) +
          (SELECT COUNT(*) FROM public.view_dom_clsrel_csminfo WHERE unp_acc = $1)
        AS total
      `;

      searchParams_arr = [unpAcc, limit, offset];
      countParams_arr = [unpAcc]; // FIXED: Only UniProt ACC for count

      // Cluster search for UniProt queries
      clusterQuery = `
        (SELECT DISTINCT
          c.id,
          SUBSTRING(c.id, 1, 1) AS label,
          c.name,
          c.type,
          100 as relevance_score,
          (CASE c.type
            WHEN 'A' THEN 1
            WHEN 'X' THEN 2
            WHEN 'H' THEN 3
            WHEN 'T' THEN 4
            WHEN 'F' THEN 5
            ELSE 6
          END) as type_order
        FROM
          public.cluster c
        JOIN
          public.view_dom_clsrel_pdbinfo v ON (
            c.id = v.fid OR c.id = v.tid OR c.id = v.hid OR c.id = v.xid
          )
        WHERE
          v.unp_acc = $1)

        UNION

        (SELECT DISTINCT
          c.id,
          SUBSTRING(c.id, 1, 1) AS label,
          c.name,
          c.type,
          100 as relevance_score,
          (CASE c.type
            WHEN 'A' THEN 1
            WHEN 'X' THEN 2
            WHEN 'H' THEN 3
            WHEN 'T' THEN 4
            WHEN 'F' THEN 5
            ELSE 6
          END) as type_order
        FROM
          public.cluster c
        JOIN
          public.view_dom_clsrel_csminfo v ON (
            c.id = v.fid OR c.id = v.tid OR c.id = v.hid OR c.id = v.xid
          )
        WHERE
          v.unp_acc = $1)

        ORDER BY
          type_order,
          id
        LIMIT 20
      `;
      clusterParams = [unpAcc];
    }

    console.log('Executing search query:', searchQuery?.substring(0, 100) + '...');
    console.log('Search params:', searchParams_arr);
    console.log('Count params:', countParams_arr);

    // FIXED: Execute search and get total count with correct parameters
    const [searchResult, countResult, clusterResult] = await Promise.all([
      query(searchQuery!, searchParams_arr!),
      query(totalCountQuery!, countParams_arr!), // FIXED: Use separate count parameters
      clusterQuery ? query(clusterQuery, clusterParams!) : Promise.resolve({ rows: [] })
    ]);

    const totalCount = parseInt(countResult.rows[0].total);

    console.log(`Found ${searchResult.rows.length} domains and ${clusterResult.rows.length} clusters`);

    // Format the response
    const response = {
      query: q || pdbId || unpAcc,
      searchType: q ? 'keyword' : pdbId ? 'pdb' : 'uniprot',
      domains: searchResult.rows.map(domain => ({
        id: domain.id,
        range: domain.range || '',
        xname: domain.xname || '',
        hname: domain.hname || '',
        tname: domain.tname || '',
        proteinName: domain.protein_name || '',
        sourceType: domain.source_type,
        relevanceScore: domain.relevance_score,
        isRepresentative: domain.is_representative === 1,
        isManual: domain.is_manual === 1,
        domainLength: domain.domain_length
      })),
      clusters: clusterResult.rows.map(cluster => ({
        id: cluster.id,
        label: cluster.label || cluster.id.charAt(0),
        name: cluster.name || '',
        type: cluster.type || '',
        relevanceScore: cluster.relevance_score
        // Note: type_order is used for sorting but not exposed in the API response
      })),
      totalResults: totalCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1
      },
      sorting: {
        sortBy,
        sortOrder
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform search',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function for sort clauses
function getSortClause(sortBy: string, sortOrder: string): string {
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  switch (sortBy) {
    case 'relevance':
      return `relevance_score ${order}, is_representative ${order}, is_manual ${order}, id ASC`;
    case 'id':
      return `id ${order}`;
    case 'classification':
      return `xid ${order}, hid ${order}, tid ${order}, fid ${order}, id ASC`;
    case 'representatives':
      return `is_representative ${order}, is_manual ${order}, relevance_score DESC, id ASC`;
    case 'length':
      return `domain_length ${order} NULLS LAST, id ASC`;
    default:
      return `relevance_score DESC, is_representative DESC, is_manual DESC, id ASC`;
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
