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
    
    // Get the classification level from first character
    const level = classificationId.charAt(0).toLowerCase();
    
    // Validate classification ID pattern
    const validLevels = ['f', 't', 'h', 'x', 'a'];
    if (!validLevels.includes(level) || !/^[FTHXA][\.0-9]*$/.test(classificationId)) {
      return NextResponse.json(
        { error: `Invalid classification ID: ${classificationId}` },
        { status: 400 }
      );
    }
    
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
