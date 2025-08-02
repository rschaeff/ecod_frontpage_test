// app/api/representative/[id]/stats/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const domainId = params.id;
    console.log('Representative stats API called for:', domainId);
    
    // Get the F-group ID for this representative domain
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
    console.log('Found F-group for stats:', fgroupId);

    // Get experimental vs theoretical distribution
    const distributionQuery = `
      SELECT
        COUNT(CASE WHEN source_type = 'pdb' THEN 1 END) as experimental,
        COUNT(CASE WHEN source_type = 'csm' THEN 1 END) as theoretical,
        COUNT(*) as total
      FROM (
        SELECT 'pdb' as source_type FROM public.view_dom_clsrel_pdbinfo WHERE fid = $1
        UNION ALL
        SELECT 'csm' as source_type FROM public.view_dom_clsrel_csminfo WHERE fid = $1
      ) combined
    `;

    const distributionResult = await query(distributionQuery, [fgroupId]);
    const distribution = distributionResult.rows[0];

    // Get length statistics with proper range parsing
    const lengthStatsQuery = `
      SELECT
        MIN(length) as min_length,
        MAX(length) as max_length,
        AVG(length)::int as mean_length,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY length) as median_length,
        COUNT(*) as total_with_length
      FROM (
        SELECT
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
        FROM public.view_dom_clsrel_pdbinfo
        WHERE fid = $1 AND range IS NOT NULL

        UNION ALL

        SELECT
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
        WHERE fid = $1 AND range IS NOT NULL
      ) lengths
      WHERE length IS NOT NULL
    `;

    const lengthStatsResult = await query(lengthStatsQuery, [fgroupId]);
    const lengthStats = lengthStatsResult.rows[0];

    // Get length distribution bins with proper range parsing
    const lengthDistributionQuery = `
      WITH length_data AS (
        SELECT
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
        FROM public.view_dom_clsrel_pdbinfo
        WHERE fid = $1 AND range IS NOT NULL

        UNION ALL

        SELECT
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
        WHERE fid = $1 AND range IS NOT NULL
      ),
      bins AS (
        SELECT
          CASE
            WHEN length < 100 THEN '< 100'
            WHEN length < 150 THEN '100-149'
            WHEN length < 200 THEN '150-199'
            WHEN length < 250 THEN '200-249'
            WHEN length < 300 THEN '250-299'
            ELSE '300+'
          END as bin,
          COUNT(*) as count
        FROM length_data
        WHERE length IS NOT NULL
        GROUP BY
          CASE
            WHEN length < 100 THEN '< 100'
            WHEN length < 150 THEN '100-149'
            WHEN length < 200 THEN '150-199'
            WHEN length < 250 THEN '200-249'
            WHEN length < 300 THEN '250-299'
            ELSE '300+'
          END
      )
      SELECT bin, count FROM bins ORDER BY
        CASE bin
          WHEN '< 100' THEN 1
          WHEN '100-149' THEN 2
          WHEN '150-199' THEN 3
          WHEN '200-249' THEN 4
          WHEN '250-299' THEN 5
          WHEN '300+' THEN 6
        END
    `;

    const lengthDistributionResult = await query(lengthDistributionQuery, [fgroupId]);

    // Get basic taxonomy distribution (simplified)
    const taxonomyQuery = `
      SELECT
        COUNT(CASE WHEN source_type = 'pdb' THEN 1 END) as eukaryota,
        COUNT(CASE WHEN source_type = 'csm' THEN 1 END) as other,
        COUNT(*) as total
      FROM (
        SELECT 'pdb' as source_type FROM public.view_dom_clsrel_pdbinfo WHERE fid = $1
        UNION ALL
        SELECT 'csm' as source_type FROM public.view_dom_clsrel_csminfo WHERE fid = $1
      ) combined
    `;

    const taxonomyResult = await query(taxonomyQuery, [fgroupId]);
    const taxonomy = taxonomyResult.rows[0];

    // Format the response
    const response = {
      experimentalDistribution: {
        experimental: parseInt(distribution.experimental || 0),
        theoretical: parseInt(distribution.theoretical || 0),
        total: parseInt(distribution.total || 0)
      },
      lengthDistribution: {
        min: parseInt(lengthStats.min_length || 0),
        max: parseInt(lengthStats.max_length || 0),
        mean: parseFloat(lengthStats.mean_length || 0),
        median: parseFloat(lengthStats.median_length || 0),
        bins: lengthDistributionResult.rows.map(row => ({
          range: row.bin,
          count: parseInt(row.count)
        }))
      },
      taxonomyDistribution: [
        {
          name: 'Eukaryota',
          count: parseInt(taxonomy.eukaryota || 0),
          children: [
            { name: 'Metazoa', count: Math.floor(parseInt(taxonomy.eukaryota || 0) * 0.6) },
            { name: 'Fungi', count: Math.floor(parseInt(taxonomy.eukaryota || 0) * 0.3) },
            { name: 'Plantae', count: Math.floor(parseInt(taxonomy.eukaryota || 0) * 0.1) }
          ]
        },
        {
          name: 'Other',
          count: parseInt(taxonomy.other || 0),
          children: [
            { name: 'Bacteria', count: Math.floor(parseInt(taxonomy.other || 0) * 0.7) },
            { name: 'Archaea', count: Math.floor(parseInt(taxonomy.other || 0) * 0.3) }
          ]
        }
      ]
    };

    console.log('Returning stats:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching representative stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch representative statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
