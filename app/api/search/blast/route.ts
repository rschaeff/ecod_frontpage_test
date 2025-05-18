// app/api/search/blast/route.ts
import { NextResponse } from 'next/server';

/**
 * API route to perform BLAST search for protein sequence similarity
 * POST /api/search/blast
 * Body: sequence (FASTA format)
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sequence = formData.get('sequence') as string;
    
    if (!sequence) {
      return NextResponse.json(
        { error: 'No sequence provided' },
        { status: 400 }
      );
    }
    
    // In a real app, this would connect to a BLAST service or use a local BLAST installation
    // For now, we'll return a mock response
    
    // Mock BLAST results
    const results = [
      {
        domain_id: 'e1hhoA1',
        match_start: 1,
        match_end: 141,
        e_value: 1.2e-65,
        bit_score: 215.4,
        identity: 97.8,
        alignment_length: 141,
        classification: {
          fgroup: { id: 'F1.1.1.1.1', name: 'Hemoglobin, alpha-chain' },
          tgroup: { id: 'T1.1.1.1', name: 'Globin' },
          hgroup: { id: 'H1.1.1', name: 'Globin-like' },
          xgroup: { id: 'X1.1', name: 'Globin-like' }
        }
      },
      {
        domain_id: 'e2dn3A1',
        match_start: 5,
        match_end: 137,
        e_value: 3.5e-48,
        bit_score: 178.2,
        identity: 72.4,
        alignment_length: 134,
        classification: {
          fgroup: { id: 'F1.1.1.1.2', name: 'Hemoglobin, beta-chain' },
          tgroup: { id: 'T1.1.1.1', name: 'Globin' },
          hgroup: { id: 'H1.1.1', name: 'Globin-like' },
          xgroup: { id: 'X1.1', name: 'Globin-like' }
        }
      }
    ];
    
    return NextResponse.json({
      query_length: sequence.length,
      hits: results
    });
  } catch (error) {
    console.error('Error processing BLAST search:', error);
    return NextResponse.json(
      { error: 'Failed to process BLAST search' },
      { status: 500 }
    );
  }
}
