// app/api/domains/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const domainId = params.id;
    
    // Determine if it's a PDB domain or AlphaFold domain
    const typeQuery = `
      SELECT type FROM public.domain WHERE id = $1
    `;
    const typeResult = await query(typeQuery, [domainId]);
    
    if (typeResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Domain with ID ${domainId} not found` },
        { status: 404 }
      );
    }
    
    const domainType = typeResult.rows[0].type;
    
    // Use appropriate view based on domain type
    let domainInfo;
    if (domainType === 'experimental structure') {
      // For PDB domains
      const pdbInfoQuery = `
        SELECT * FROM public.view_dom_clsrel_pdbinfo 
        WHERE id = $1
      `;
      const result = await query(pdbInfoQuery, [domainId]);
      domainInfo = result.rows[0];
    } else {
      // For AlphaFold/computed models
      const csmInfoQuery = `
        SELECT * FROM public.view_dom_clsrel_csminfo 
        WHERE id = $1
      `;
      const result = await query(csmInfoQuery, [domainId]);
      domainInfo = result.rows[0];
    }
    
    // Get sequence for this domain
    const sequenceQuery = `
      SELECT fasta FROM public.fasta WHERE uid = $1
    `;
    const sequenceResult = await query(sequenceQuery, [domainInfo.uid]);
    const sequence = sequenceResult.rows.length > 0 ? sequenceResult.rows[0].fasta : null;
    
    // Format response
    const response = {
      id: domainInfo.id,
      uid: domainInfo.uid,
      range: domainInfo.range,
      type: domainInfo.type,
      is_manual: domainInfo.is_manual,
      sequence: sequence,
      classification: {
        fgroup: { 
          id: domainInfo.fid,
          name: domainInfo.fname,
          pfam_acc: domainInfo.pfam_acc,
          clan_acc: domainInfo.clan_acc
        },
        tgroup: {
          id: domainInfo.tid,
          name: domainInfo.tname
        },
        hgroup: {
          id: domainInfo.hid,
          name: domainInfo.hname
        },
        xgroup: {
          id: domainInfo.xid,
          name: domainInfo.xname
        }
      },
      uniprot: {
        accession: domainInfo.unp_acc,
        name: domainInfo.name,
        gene_name: domainInfo.gene_name,
        full_name: domainInfo.full_name
      },
      drugbank: {
        accessions: domainInfo.drugbank_acc ? domainInfo.drugbank_acc.split(',') : [],
        links: domainInfo.drugdomain_link ? domainInfo.drugdomain_link.split(',') : []
      },
      comment: domainInfo.comment
    };
    
    // Add PDB-specific fields if applicable
    if (domainType === 'experimental structure') {
      Object.assign(response, {
        pdb: {
          id: domainInfo.pdb_id,
          chains: domainInfo.chain_str ? domainInfo.chain_str.split(',') : [],
          is_obsolete: domainInfo.is_obsolete
        }
      });
    } else {
      // For AlphaFold structures, include source_id
      Object.assign(response, {
        source_id: domainInfo.source_id
      });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain data' },
      { status: 500 }
    );
  }
}
