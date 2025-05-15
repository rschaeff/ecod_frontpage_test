// app/api/proteins/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const proteinId = params.id.toUpperCase();
    
    // Handle both PDB ID and PDB_Chain formats
    let pdbId, chainId;
    if (proteinId.includes('_')) {
      [pdbId, chainId] = proteinId.split('_');
    } else {
      pdbId = proteinId;
      chainId = null;
    }
    
    // Get chain info if available
    let chainInfo = null;
    if (chainId) {
      const chainInfoQuery = `
        SELECT * FROM public.pdb_chain_info 
        WHERE pdb_id = $1 AND chain_id = $2
      `;
      const chainInfoResult = await query(chainInfoQuery, [pdbId, chainId]);
      if (chainInfoResult.rows.length > 0) {
        chainInfo = chainInfoResult.rows[0];
      }
    }
    
    // Get PDB info
    const pdbInfoQuery = `
      SELECT * FROM public.pdb_info 
      WHERE pdb = $1
    `;
    const pdbInfoResult = await query(pdbInfoQuery, [pdbId]);
    const pdbInfo = pdbInfoResult.rows.length > 0 ? pdbInfoResult.rows[0] : null;
    
    if (!pdbInfo) {
      return NextResponse.json(
        { error: `No information found for PDB ID: ${pdbId}` },
        { status: 404 }
      );
    }
    
    // Get all domains for this PDB/chain
    let domainsQuery = `
      SELECT * FROM public.view_dom_clsrel_pdbinfo 
      WHERE pdb_id = $1
    `;
    
    const queryParams = [pdbId];
    if (chainId) {
      domainsQuery += ` AND chain_str LIKE $2`;
      queryParams.push(`%${chainId}%`);
    }
    
    domainsQuery += ` ORDER BY start_index`;
    
    const domainsResult = await query(domainsQuery, queryParams);
    
    // Format protein response
    const response = {
      id: pdbId + (chainId ? `_${chainId}` : ''),
      pdb_id: pdbId,
      chain_id: chainId,
      name: chainInfo?.name || `PDB ${pdbId}${chainId ? ` Chain ${chainId}` : ''}`,
      method: pdbInfo.method,
      resolution: pdbInfo.resolution,
      pmid: pdbInfo.pmid,
      doi: pdbInfo.doi,
      domains: domainsResult.rows.map((domain, index) => {
        // Extract range values
        const range = domain.range || '';
        const [rangeStart, rangeEnd] = range.split('-').map(v => parseInt(v, 10));
        
        // Create color palette
        const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0', '#FF9800'];
        
        return {
          id: domain.id,
          range: domain.range || '',
          rangeStart: rangeStart || 0,
          rangeEnd: rangeEnd || 0,
          ecod: {
            xgroup: domain.xid,
            hgroup: domain.hid,
            tgroup: domain.tid,
            fgroup: domain.fid
          },
          color: colors[index % colors.length],
          description: domain.fname || `Domain ${index + 1}`
        };
      })
    };
    
    // Add additional UniProt info if available from first domain
    if (domainsResult.rows.length > 0 && domainsResult.rows[0].unp_acc) {
      const firstDomain = domainsResult.rows[0];
      response.uniprotId = firstDomain.unp_acc;
      response.organism = firstDomain.full_name || 'Unknown';
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching protein:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protein data' },
      { status: 500 }
    );
  }
}
