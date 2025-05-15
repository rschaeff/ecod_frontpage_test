// app/api/classification/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classificationId = params.id;
    
    // Get the classification level from first character
    const level = classificationId.charAt(0).toLowerCase();
    
    // Validate classification ID pattern
    const validLevels = ['f', 't', 'h', 'x'];
    if (!validLevels.includes(level) || !/^[FTHX][\.0-9]+$/.test(classificationId)) {
      return NextResponse.json(
        { error: `Invalid classification ID: ${classificationId}` },
        { status: 400 }
      );
    }
    
    // Get this classification node
    const nodeQuery = `
      SELECT id, name, parent, type, domain_number
      FROM public.cluster
      WHERE id = $1
    `;
    
    const nodeResult = await query(nodeQuery, [classificationId]);
    
    if (nodeResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Classification node ${classificationId} not found` },
        { status: 404 }
      );
    }
    
    const node = nodeResult.rows[0];
    
    // Get children nodes
    const childrenQuery = `
      SELECT id, name, type, domain_number
      FROM public.cluster
      WHERE parent = $1
      ORDER BY id
    `;
    
    const childrenResult = await query(childrenQuery, [classificationId]);
    
    // Get representative domains for this classification
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
        ${level}id = $1 AND is_rep = true
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
        ${level}id = $1 AND is_rep = true
      LIMIT 10)
    `;
    
    const domainsResult = await query(domainsQuery, [classificationId]);
    
    // Format response
    const response = {
      id: node.id,
      name: node.name,
      level: node.type,
      parent: node.parent,
      domainCount: node.domain_number,
      children: childrenResult.rows,
      representatives: domainsResult.rows.map(domain => ({
        id: domain.id,
        range: domain.range,
        pdb_id: domain.pdb_id,
        chain: domain.chain_str,
        uniprot: domain.unp_acc,
        isManual: domain.is_manual
      }))
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching classification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classification data' },
      { status: 500 }
    );
  }
}
