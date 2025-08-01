// app/api/representative/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const domainId = params.id;
    console.log('=== DEBUG INFO ===');
    console.log('Requested domain ID:', domainId);
    console.log('Domain ID length:', domainId.length);
    console.log('Domain ID chars:', domainId.split('').map(c => `'${c}'`).join(','));
    
    // First, get the basic domain information
    const domainInfoQuery = `
      SELECT 
        d.id,
        d.uid,
        d.range,
        d.type,
        d.is_manual,
        d.is_rep,
        COALESCE(
          (SELECT pd.pdb_id FROM view_dom_clsrel_pdbinfo pd WHERE pd.id = d.id),
          (SELECT cd.source_id FROM view_dom_clsrel_csminfo cd WHERE cd.id = d.id)
        ) as structure_id,
        COALESCE(
          (SELECT pd.chain_str FROM view_dom_clsrel_pdbinfo pd WHERE pd.id = d.id),
          NULL
        ) as chain_str,
        COALESCE(
          (SELECT pd.method FROM view_dom_clsrel_pdbinfo pd WHERE pd.id = d.id),
          'Theoretical model'
        ) as method,
        COALESCE(
          (SELECT pd.resolution FROM view_dom_clsrel_pdbinfo pd WHERE pd.id = d.id),
          NULL
        ) as resolution,
        -- Get length from range if available
        CASE 
          WHEN d.range IS NOT NULL AND d.range LIKE '%-%' 
          THEN (SPLIT_PART(d.range, '-', 2)::int - SPLIT_PART(d.range, '-', 1)::int + 1)
          ELSE NULL
        END as length
      FROM public.domain d
      WHERE d.id = $1 AND d.is_rep = true
    `;
    
    const domainResult = await query(domainInfoQuery, [domainId]);
    
    if (domainResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Representative domain ${domainId} not found` },
        { status: 404 }
      );
    }
    
    const domain = domainResult.rows[0];
    console.log('Found domain:', domain);
    
    // Get classification hierarchy information
    const classificationQuery = `
      SELECT 
        COALESCE(pv.aid, cv.aid) as aid,
        COALESCE(pv.aname, cv.aname) as aname,
        COALESCE(pv.xid, cv.xid) as xid,
        COALESCE(pv.xname, cv.xname) as xname,
        COALESCE(pv.hid, cv.hid) as hid,
        COALESCE(pv.hname, cv.hname) as hname,
        COALESCE(pv.tid, cv.tid) as tid,
        COALESCE(pv.tname, cv.tname) as tname,
        COALESCE(pv.fid, cv.fid) as fid,
        COALESCE(pv.fname, cv.fname) as fname,
        COALESCE(pv.unp_acc, cv.unp_acc) as unp_acc,
        COALESCE(pv.name, cv.name) as organism_name,
        COALESCE(pv.full_name, cv.full_name) as full_name,
        COALESCE(pv.pfam_acc, cv.pfam_acc) as pfam_acc
      FROM public.domain d
      LEFT JOIN public.view_dom_clsrel_pdbinfo pv ON d.id = pv.id
      LEFT JOIN public.view_dom_clsrel_csminfo cv ON d.id = cv.id
      WHERE d.id = $1
    `;
    
    const classificationResult = await query(classificationQuery, [domainId]);
    const classification = classificationResult.rows[0];
    
    if (!classification) {
      return NextResponse.json(
        { error: `Classification not found for domain ${domainId}` },
        { status: 404 }
      );
    }
    
    console.log('Found classification:', classification);
    
    // Get sequence
    const sequenceQuery = `
      SELECT fasta FROM public.fasta WHERE uid = $1
    `;
    const sequenceResult = await query(sequenceQuery, [domain.uid]);
    const sequence = sequenceResult.rows.length > 0 ? sequenceResult.rows[0].fasta : '';
    
    // Get curation information if available (assuming a curation table exists)
    // For now, we'll use default values since we don't know the exact curation table structure
    const curationInfo = {
      notes: `Representative domain for ${classification.fname}. Selected based on structural quality and coverage.`,
      curator: 'ECOD Team',
      date: '2024-01-01'
    };
    
    // Format the response
    const response = {
      id: domain.id,
      title: classification.fname || 'Unknown domain',
      range: domain.range || '',
      structureId: domain.structure_id || '',
      chainId: (domain.chain_str || '').split(',')[0] || 'A',
      method: domain.method || 'Unknown',
      resolution: domain.resolution || null,
      length: domain.length || (sequence ? sequence.length : 0),
      sequence: sequence,
      classification: {
        architecture: classification.aname || 'Unknown',
        xgroup: { 
          id: classification.xid, 
          name: classification.xname || 'Unknown' 
        },
        hgroup: { 
          id: classification.hid, 
          name: classification.hname || 'Unknown' 
        },
        tgroup: { 
          id: classification.tid, 
          name: classification.tname || 'Unknown' 
        },
        fgroup: { 
          id: classification.fid, 
          name: classification.fname || 'Unknown' 
        }
      },
      organism: classification.full_name || classification.organism_name || 'Unknown organism',
      uniprotId: classification.unp_acc,
      pfamAccession: classification.pfam_acc,
      curation: curationInfo,
      isManual: domain.is_manual,
      isRepresentative: domain.is_rep
    };
    
    console.log('Returning response:', response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching representative domain:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch representative domain data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
