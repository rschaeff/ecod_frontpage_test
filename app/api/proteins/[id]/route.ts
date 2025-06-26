// app/api/proteins/[id]/route.ts - Complete fixed version with proper TypeScript
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { QueryResult } from '@/lib/db';

// Type definitions for the protein API
interface PDBInfoRow {
  id: string;
  range: string | null;
  unp_acc: string | null;
  pdb_id: string;
  chain_str: string | null;
  method: string | null;
  resolution: number | null;
  xid: string;
  hid: string;
  tid: string;
  fid: string;
  fname: string | null;
  name: string | null;
  full_name: string | null;
  start_index: number | null;
  [key: string]: any; // For additional fields
}

interface PDBChainInfoRow {
  pdb_id: string;
  chain_id: string;
  name: string | null;
  [key: string]: any;
}

interface PDBInfoMainRow {
  pdb: string;
  method: string | null;
  resolution: number | null;
  pmid: string | null;
  doi: string | null;
  [key: string]: any;
}

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const proteinId = params.id.toUpperCase();

    // Handle both PDB ID and PDB_Chain formats
    let pdbId: string;
    let chainId: string | null;

    if (proteinId.includes('_')) {
      [pdbId, chainId] = proteinId.split('_');
    } else {
      pdbId = proteinId;
      chainId = null;
    }

    // Get chain info if available
    let chainInfo: PDBChainInfoRow | null = null;
    if (chainId) {
      const chainInfoQuery = `
        SELECT * FROM public.pdb_chain_info
        WHERE pdb_id = $1 AND chain_id = $2
      `;
      const chainInfoResult: QueryResult<PDBChainInfoRow> = await query(chainInfoQuery, [pdbId, chainId]);
      if (chainInfoResult.rows.length > 0) {
        chainInfo = chainInfoResult.rows[0];
      }
    }

    // Get PDB info
    const pdbInfoQuery = `
      SELECT * FROM public.pdb_info
      WHERE pdb = $1
    `;
    const pdbInfoResult: QueryResult<PDBInfoMainRow> = await query(pdbInfoQuery, [pdbId]);
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

    const queryParams: (string | number)[] = [pdbId];
    if (chainId) {
      domainsQuery += ` AND chain_str LIKE $2`;
      queryParams.push(`%${chainId}%`);
    }

    domainsQuery += ` ORDER BY start_index`;

    const domainsResult: QueryResult<PDBInfoRow> = await query(domainsQuery, queryParams);

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
      domains: domainsResult.rows.map((domain: PDBInfoRow, index: number) => {
        // Extract range values with proper typing
        const range = domain.range || '';
        const [rangeStart, rangeEnd] = range.split('-').map((v: string) => parseInt(v, 10));

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
      (response as any).uniprotId = firstDomain.unp_acc;
      (response as any).organism = firstDomain.full_name || 'Unknown';
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
