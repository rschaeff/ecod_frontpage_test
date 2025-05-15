// app/api/structures/[id]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { query } from '@/lib/db';

// Configure path to PDB files
const PDB_BASE_PATH = process.env.PDB_BASE_PATH || '/data/ecod/pdb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id.toLowerCase();
    
    // Check if this is a domain ID or PDB ID
    let pdbId, chainId;
    
    if (id.startsWith('e')) {
      // This is a domain ID, need to get PDB and chain
      const domainQuery = `
        SELECT pdb_id, chain_str 
        FROM public.view_dom_clsrel_pdbinfo 
        WHERE id = $1
      `;
      
      const domainResult = await query(domainQuery, [id]);
      
      if (domainResult.rows.length === 0) {
        return NextResponse.json(
          { error: `Domain ${id} not found` },
          { status: 404 }
        );
      }
      
      pdbId = domainResult.rows[0].pdb_id.toLowerCase();
      chainId = domainResult.rows[0].chain_str?.split(',')[0] || '';
    } else {
      // This might be a PDB ID or PDB_chain format
      if (id.includes('_')) {
        [pdbId, chainId] = id.split('_');
      } else {
        pdbId = id;
        chainId = '';
      }
    }
    
    // Construct file path
    let filePath;
    if (chainId) {
      // Look for chain-specific PDB file
      filePath = path.join(PDB_BASE_PATH, `${pdbId}_${chainId}.pdb`);
    } else {
      // Look for full PDB file
      filePath = path.join(PDB_BASE_PATH, `${pdbId}.pdb`);
    }
    
    try {
      const pdbData = await fs.readFile(filePath, 'utf-8');
      
      // Return the PDB file with appropriate headers
      return new NextResponse(pdbData, {
        headers: {
          'Content-Type': 'chemical/x-pdb',
          'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`
        }
      });
    } catch (fsError) {
      console.error(`PDB file not found: ${filePath}`, fsError);
      
      // If chain-specific file wasn't found, try without chain
      if (chainId) {
        try {
          const fullPdbPath = path.join(PDB_BASE_PATH, `${pdbId}.pdb`);
          const fullPdbData = await fs.readFile(fullPdbPath, 'utf-8');
          
          // Return the full PDB file
          return new NextResponse(fullPdbData, {
            headers: {
              'Content-Type': 'chemical/x-pdb',
              'Content-Disposition': `attachment; filename="${pdbId}.pdb"`
            }
          });
        } catch (secondFsError) {
          return NextResponse.json(
            { error: `Structure files for ${pdbId} not found` },
            { status: 404 }
          );
        }
      }
      
      return NextResponse.json(
        { error: `Structure ${pdbId} not found` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving PDB structure:', error);
    return NextResponse.json(
      { error: 'Failed to serve structure data' },
      { status: 500 }
    );
  }
}
