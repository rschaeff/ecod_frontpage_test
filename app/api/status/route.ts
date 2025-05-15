// app/api/status/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const versionQuery = `SELECT value FROM public.info WHERE name = 'version'`;
    const dateQuery = `SELECT value FROM public.info WHERE name = 'update_date'`;
    
    const [versionResult, dateResult] = await Promise.all([
      query(versionQuery),
      query(dateQuery)
    ]);
    
    const version = versionResult.rows.length > 0 ? versionResult.rows[0].value : 'unknown';
    const lastUpdate = dateResult.rows.length > 0 ? dateResult.rows[0].value : 'unknown';
    
    return NextResponse.json({
      version,
      lastUpdate,
      status: 'online'
    });
  } catch (error) {
    console.error('Error fetching database status:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch database status'
    }, { status: 500 });
  }
}
