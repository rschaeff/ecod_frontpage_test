// app/api/tree/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * API route to get tree nodes at a specific level or children of a parent node
 * GET /api/tree?level=A - Get all A-level nodes
 * GET /api/tree?parent=X1.1 - Get children of X1.1
 */
export async function GET(request: Request) {
  try {
    console.log('Tree API called with URL:', request.url);

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || 'A';
    const parentId = searchParams.get('parent') || null;

    console.log('Tree API params:', { level, parentId });

    // Validate level parameter
    const validLevels = ['A', 'X', 'H', 'T', 'F'];
    if (!validLevels.includes(level)) {
      console.error('Invalid level:', level);
      return NextResponse.json(
        { error: `Invalid level: ${level}. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Build query based on whether we're getting children or root nodes
    let nodesQuery;
    let queryParams = [];

    if (parentId) {
      // Get children of a specific parent
      console.log('Fetching children for parent:', parentId);
      nodesQuery = `
        SELECT id, name, type, domain_number
        FROM public.cluster
        WHERE parent = $1
        ORDER BY id
      `;
      queryParams = [parentId];
    } else {
      // Get root nodes at specified level
      console.log('Fetching root nodes for level:', level);
      nodesQuery = `
        SELECT id, name, type, domain_number
        FROM public.cluster
        WHERE type = $1 AND (parent IS NULL OR parent = '')
        ORDER BY id
      `;
      queryParams = [level];
    }

    console.log('Executing query:', nodesQuery);
    console.log('Query params:', queryParams);

    const nodesResult = await query(nodesQuery, queryParams);
    console.log('Query results:', nodesResult.rows.length, 'rows returned');

    // Format response
    const response = {
      level,
      parent: parentId,
      nodes: nodesResult.rows.map(node => ({
        id: node.id,
        name: node.name,
        level: node.type,
        domainCount: node.domain_number || 0
      }))
    };

    console.log('Returning response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in tree API:', error);

    // Return detailed error information for debugging
    return NextResponse.json(
      {
        error: 'Failed to fetch tree data',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
