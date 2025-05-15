// app/api/search/route.ts
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

    if (!q && !pdbId && !unpAcc) {
      return NextResponse.json(
        { error: 'No search criteria provided. Use q, pdb, or unp_acc parameters.' },
        { status: 400 }
      );
    }

    let searchQuery, totalCountQuery, queryParams;

    if (q) {
      // General keyword search across domain IDs and classification names
      searchQuery = `
        (SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'pdb' AS source_type
        FROM
          public.view_dom_clsrel_pdbinfo
        WHERE
          id ILIKE $1
          OR xname ILIKE $1
          OR hname ILIKE $1
          OR tname ILIKE $1
          OR fname ILIKE $1
        LIMIT $2 OFFSET $3)

        UNION ALL

        (SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'csm' AS source_type
        FROM
          public.view_dom_clsrel_csminfo
        WHERE
          id ILIKE $1
          OR xname ILIKE $1
          OR hname ILIKE $1
          OR tname ILIKE $1
          OR fname ILIKE $1
        LIMIT $2 OFFSET $3)
      `;

      totalCountQuery = `
        SELECT
          (SELECT COUNT(*) FROM public.view_dom_clsrel_pdbinfo
           WHERE id ILIKE $1 OR xname ILIKE $1 OR hname ILIKE $1 OR tname ILIKE $1 OR fname ILIKE $1) +
          (SELECT COUNT(*) FROM public.view_dom_clsrel_csminfo
           WHERE id ILIKE $1 OR xname ILIKE $1 OR hname ILIKE $1 OR tname ILIKE $1 OR fname ILIKE $1)
        AS total
      `;

      queryParams = [`%${q}%`, limit, offset];
    } else if (pdbId) {
      // Search by PDB ID
      searchQuery = `
        SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'pdb' AS source_type
        FROM
          public.view_dom_clsrel_pdbinfo
        WHERE
          pdb_id = $1
        LIMIT $2 OFFSET $3
      `;

      totalCountQuery = `
        SELECT COUNT(*) AS total
        FROM public.view_dom_clsrel_pdbinfo
        WHERE pdb_id = $1
      `;

      queryParams = [pdbId, limit, offset];
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
          'pdb' AS source_type
        FROM
          public.view_dom_clsrel_pdbinfo
        WHERE
          unp_acc = $1
        LIMIT $2 OFFSET $3)

        UNION ALL

        (SELECT
          id AS id,
          range,
          xname,
          hname,
          tname,
          fname AS protein_name,
          'csm' AS source_type
        FROM
          public.view_dom_clsrel_csminfo
        WHERE
          unp_acc = $1
        LIMIT $2 OFFSET $3)
      `;

      totalCountQuery = `
        SELECT
          (SELECT COUNT(*) FROM public.view_dom_clsrel_pdbinfo WHERE unp_acc = $1) +
          (SELECT COUNT(*) FROM public.view_dom_clsrel_csminfo WHERE unp_acc = $1)
        AS total
      `;

      queryParams = [unpAcc, limit, offset];
    }

    // Execute search and get total count
    const [searchResult, countResult] = await Promise.all([
      query(searchQuery, queryParams),
      query(totalCountQuery, [queryParams[0]])
    ]);

    const totalCount = parseInt(countResult.rows[0].total);

    // Find relevant classification clusters
    let clusterQuery;
    if (q) {
      clusterQuery = `
        SELECT DISTINCT
          id,
          SUBSTRING(id, 1, 1) AS label,
          name
        FROM
          public.cluster
        WHERE
          name ILIKE $1
        LIMIT 10
      `;
    } else if (pdbId) {
      clusterQuery = `
        SELECT DISTINCT
          c.id,
          SUBSTRING(c.id, 1, 1) AS label,
          c.name
        FROM
          public.cluster c
        JOIN
          public.view_dom_clsrel_pdbinfo v ON (
            c.id = v.fid OR c.id = v.tid OR c.id = v.hid OR c.id = v.xid
          )
        WHERE
          v.pdb_id = $1
        LIMIT 10
      `;
    } else if (unpAcc) {
      clusterQuery = `
        (SELECT DISTINCT
          c.id,
          SUBSTRING(c.id, 1, 1) AS label,
          c.name
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
          c.name
        FROM
          public.cluster c
        JOIN
          public.view_dom_clsrel_csminfo v ON (
            c.id = v.fid OR c.id = v.tid OR c.id = v.hid OR c.id = v.xid
          )
        WHERE
          v.unp_acc = $1)
        LIMIT 10
      `;
    }

    const clusterResult = await query(clusterQuery, [queryParams[0]]);

    return NextResponse.json({
      query: q || pdbId || unpAcc,
      domains: searchResult.rows,
      clusters: clusterResult.rows,
      totalResults: totalCount
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
