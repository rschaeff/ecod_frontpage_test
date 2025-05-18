// app/api/classification/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classificationId = params.id;
    console.log('Classification API called for ID:', classificationId);

    // Determine the classification level based on ID format
    let level: string;
    let levelIdColumn: string;

    if (classificationId.startsWith('a.')) {
      // Architecture level: a.1, a.2, etc.
      level = 'A';
      levelIdColumn = 'aid';
    } else {
      // For numeric IDs, count dots to determine level
      const dotCount = (classificationId.match(/\./g) || []).length;

      switch (dotCount) {
        case 0:
          // X-group: 1008
          level = 'X';
          levelIdColumn = 'xid';
          break;
        case 1:
          // H-group: 1008.1
          level = 'H';
          levelIdColumn = 'hid';
          break;
        case 2:
          // T-group: 1008.1.1
          level = 'T';
          levelIdColumn = 'tid';
          break;
        case 3:
        default:
          // F-group: 1008.1.1.1
          level = 'F';
          levelIdColumn = 'fid';
          break;
      }
    }

    console.log('Detected level:', level, 'Column:', levelIdColumn);

    // Get this classification node
    const nodeQuery = `
      SELECT id, name, parent, type, domain_number
      FROM public.cluster
      WHERE id = $1
    `;

    console.log('Fetching node with query:', nodeQuery, 'ID:', classificationId);
    const nodeResult = await query(nodeQuery, [classificationId]);

    if (nodeResult.rows.length === 0) {
      console.error('Classification node not found:', classificationId);
      return NextResponse.json(
        { error: `Classification node ${classificationId} not found` },
        { status: 404 }
      );
    }

    const node = nodeResult.rows[0];
    console.log('Found node:', node);

    // Get children nodes
    const childrenQuery = `
      SELECT id, name, type, domain_number
      FROM public.cluster
      WHERE parent = $1
      ORDER BY id
    `;

    console.log('Fetching children for parent:', classificationId);
    const childrenResult = await query(childrenQuery, [classificationId]);
    console.log('Found children:', childrenResult.rows.length);

    // Get representative domains for this classification
    // Only fetch representatives for F-groups (leaf nodes)
    let domainsResult = { rows: [] };

    if (level === 'F') {
      const domainsQuery = `
        (SELECT
          id,
          range,
          unp_acc,
          pdb_id,
          chain_str,
          is_manual,
          is_rep
        FROM
          public.view_dom_clsrel_pdbinfo
        WHERE
          ${levelIdColumn} = $1 AND is_rep = true
        LIMIT 10)

        UNION ALL

        (SELECT
          id,
          range,
          unp_acc,
          null as pdb_id,
          null as chain_str,
          is_manual,
          is_rep
        FROM
          public.view_dom_clsrel_csminfo
        WHERE
          ${levelIdColumn} = $1 AND is_rep = true
        LIMIT 10)
      `;

      console.log('Fetching domains with column:', levelIdColumn);
      domainsResult = await query(domainsQuery, [classificationId]);
      console.log('Found representative domains:', domainsResult.rows.length);
    }

    // Format response
    const response = {
      id: node.id,
      name: node.name,
      level: level, // Use the detected level
      parent: node.parent,
      domainCount: node.domain_number || 0,
      children: childrenResult.rows.map(child => ({
        id: child.id,
        name: child.name,
        level: child.type.toUpperCase(),
        domainCount: child.domain_number || 0
      })),
      representatives: domainsResult.rows.map(domain => ({
        id: domain.id,
        range: domain.range || '',
        pdb_id: domain.pdb_id,
        chain: domain.chain_str,
        uniprot: domain.unp_acc || '',
        isManual: domain.is_manual || false
      }))
    };

    console.log('Returning response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching classification:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch classification data',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
