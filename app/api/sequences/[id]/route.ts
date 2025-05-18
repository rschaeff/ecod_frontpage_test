// Fixed version: app/api/sequences/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { searchParams } = new URL(request.url); // Fixed: Added searchParams from request URL

    // Query to get the UID for this domain
    const uidQuery = `
      SELECT uid FROM public.domain WHERE id = $1
    `;

    const uidResult = await query(uidQuery, [id]);

    if (uidResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Domain ${id} not found` },
        { status: 404 }
      );
    }

    const uid = uidResult.rows[0].uid;

    // Query to get the FASTA sequence
    const fastaQuery = `
      SELECT fasta FROM public.fasta WHERE uid = $1
    `;

    const fastaResult = await query(fastaQuery, [uid]);

    if (fastaResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No sequence found for domain ${id}` },
        { status: 404 }
      );
    }

    const sequence = fastaResult.rows[0].fasta;

    // Get domain details for the FASTA header
    const domainQuery = `
      SELECT * FROM public.view_dom_clsrel_clsname WHERE uid = $1
    `;

    const domainResult = await query(domainQuery, [uid]);
    const domain = domainResult.rows[0];

    // Format a proper FASTA response
    const fastaHeader = `>${id} | ${domain.fname || ''} | ${domain.range || ''} | ${domain.unp_acc || ''}`;
    const fastaContent = `${fastaHeader}\n${sequence}`;

    // Decide whether to return as JSON or FASTA format
    const format = searchParams.get('format') || 'json';

    if (format.toLowerCase() === 'fasta') {
      // Return raw FASTA
      return new NextResponse(fastaContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${id}.fasta"`
        }
      });
    }

    // Return as JSON
    return NextResponse.json({
      id: id,
      uid: uid,
      sequence: sequence,
      header: fastaHeader,
      fasta: fastaContent
    });
  } catch (error) {
    console.error('Error fetching sequence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sequence data' },
      { status: 500 }
    );
  }
}
