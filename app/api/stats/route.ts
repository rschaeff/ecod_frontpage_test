// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getFromCache, setCache } from '@/lib/cache';

export async function GET() {
  try {
    const cacheKey = 'db:stats';
    const cachedStats = getFromCache(cacheKey);
    if (cachedStats) {
      return NextResponse.json(cachedStats);
    }
    
    const stats = await Promise.all([
      // Total domains count
      query(`SELECT COUNT(*) AS count FROM public.domain WHERE is_obsolete IS NOT TRUE`),
      // PDB domains count
      query(`SELECT COUNT(*) AS count FROM public.domain WHERE type = 'experimental structure' AND is_obsolete IS NOT TRUE`),
      // AlphaFold domains count
      query(`SELECT COUNT(*) AS count FROM public.domain WHERE type = 'computed structural model' AND is_obsolete IS NOT TRUE`),
      // F-groups count
      query(`SELECT COUNT(DISTINCT id) AS count FROM public.cluster WHERE type = 'F' AND is_obsolete IS NOT TRUE`),
      // H-groups count
      query(`SELECT COUNT(DISTINCT id) AS count FROM public.cluster WHERE type = 'H' AND is_obsolete IS NOT TRUE`),
      // T-groups count
      query(`SELECT COUNT(DISTINCT id) AS count FROM public.cluster WHERE type = 'T' AND is_obsolete IS NOT TRUE`),
      // X-groups count
      query(`SELECT COUNT(DISTINCT id) AS count FROM public.cluster WHERE type = 'X' AND is_obsolete IS NOT TRUE`),
      // Manual representatives count
      query(`SELECT COUNT(*) AS count FROM public.domain WHERE is_manual = TRUE AND is_obsolete IS NOT TRUE`)
    ]);
    
    const response = {
      totalDomains: parseInt(stats[0].rows[0].count),
      pdbDomains: parseInt(stats[1].rows[0].count),
      alphafoldDomains: parseInt(stats[2].rows[0].count),
      fgroups: parseInt(stats[3].rows[0].count),
      hgroups: parseInt(stats[4].rows[0].count),
      tgroups: parseInt(stats[5].rows[0].count),
      xgroups: parseInt(stats[6].rows[0].count),
      manualReps: parseInt(stats[7].rows[0].count)
    };
    
    setCache(cacheKey, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching database statistics:', error);
    return NextResponse.json({
      error: 'Failed to fetch database statistics'
    }, { status: 500 });
  }
}
