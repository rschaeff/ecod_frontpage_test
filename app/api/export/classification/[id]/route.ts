// app/api/export/classification/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * API route to export classification data to CSV
 * GET /api/export/classification/F1.1.1.1 - Export domains from F1.1.1.1 to CSV
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classificationId = params.id;
    
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

    console.log('Export API - Detected level:', level, 'Column:', levelIdColumn);
    
    // Get domains for this classification
    const domainsQuery = `
      SELECT 
        d.id,
        d.range,
        d.unp_acc,
        d.pdb_id,
        d.chain_str,
        d.is_manual,
        d.xid,
        d.xname,
        d.hid,
        d.hname,
        d.tid,
        d.tname,
        d.fid,
        d.fname,
        d.pfam_acc,
        d.name AS protein_name,
        d.full_name AS organism
      FROM 
        public.view_dom_clsrel_pdbinfo d
      WHERE 
        ${level}id = $1
      
      UNION ALL
      
      SELECT 
        d.id,
        d.range,
        d.unp_acc,
        NULL as pdb_id,
        NULL as chain_str,
        d.is_manual,
        d.xid,
        d.xname,
        d.hid,
        d.hname,
        d.tid,
        d.tname,
        d.fid,
        d.fname,
        d.pfam_acc,
        d.name AS protein_name,
        d.full_name AS organism
      FROM 
        public.view_dom_clsrel_csminfo d
      WHERE 
        ${level}id = $1
    `;
    
    const domainsResult = await query(domainsQuery, [classificationId]);
    
    if (domainsResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No domains found for classification ${classificationId}` },
        { status: 404 }
      );
    }
    
    // Generate CSV header
    const csvHeader = [
      "Domain ID",
      "Range",
      "UniProt Accession",
      "PDB ID",
      "Chain",
      "Manual Representative",
      "X-group ID",
      "X-group Name",
      "H-group ID",
      "H-group Name",
      "T-group ID",
      "T-group Name",
      "F-group ID",
      "F-group Name",
      "Pfam Accession",
      "Protein Name",
      "Organism"
    ].join(",");
    
    // Generate CSV rows
    const csvRows = domainsResult.rows.map(domain => [
      domain.id,
      domain.range,
      domain.unp_acc,
      domain.pdb_id || "",
      domain.chain_str || "",
      domain.is_manual ? "Yes" : "No",
      domain.xid,
      `"${domain.xname.replace(/"/g, '""')}"`,
      domain.hid,
      `"${domain.hname.replace(/"/g, '""')}"`,
      domain.tid,
      `"${domain.tname.replace(/"/g, '""')}"`,
      domain.fid,
      `"${domain.fname.replace(/"/g, '""')}"`,
      domain.pfam_acc || "",
      `"${(domain.protein_name || "").replace(/"/g, '""')}"`,
      `"${(domain.organism || "").replace(/"/g, '""')}"`
    ].join(","));
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join("\n");
    
    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ecod_${classificationId.toLowerCase()}_domains.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting classification domains:', error);
    return NextResponse.json(
      { error: 'Failed to export classification data' },
      { status: 500 }
    );
  }
}
