// app/api/debug/tree/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Debug endpoint to test tree data queries
 */
export async function GET(request: Request) {
  try {
    // Test 1: Check if cluster table exists and get sample data
    console.log('Testing cluster table...');
    const testQuery = `
      SELECT 
        id, name, type, parent, domain_number
      FROM public.cluster 
      LIMIT 10
    `;
    
    const testResult = await query(testQuery);
    console.log('Sample cluster data:', testResult.rows);
    
    // Test 2: Check A-level nodes specifically
    console.log('Testing A-level nodes...');
    const aLevelQuery = `
      SELECT 
        id, name, type, parent, domain_number,
        CASE 
          WHEN parent IS NULL THEN 'NULL'
          WHEN parent = '' THEN 'EMPTY'
          ELSE parent
        END as parent_status
      FROM public.cluster 
      WHERE type = 'A'
      ORDER BY id
    `;
    
    const aLevelResult = await query(aLevelQuery);
    console.log('A-level nodes:', aLevelResult.rows);
    
    // Test 3: Check table structure
    console.log('Testing table structure...');
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'cluster' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    const structureResult = await query(structureQuery);
    console.log('Cluster table structure:', structureResult.rows);
    
    return NextResponse.json({
      success: true,
      tests: {
        sampleData: testResult.rows,
        aLevelNodes: aLevelResult.rows,
        tableStructure: structureResult.rows
      }
    });
    
  } catch (error) {
    console.error('Debug query failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
