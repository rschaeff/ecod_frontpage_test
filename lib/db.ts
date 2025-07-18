// lib/db.ts - Your existing implementation enhanced with TypeScript
import { Pool, QueryResult as PgQueryResult } from 'pg';

// Type-safe wrapper for PostgreSQL query results
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '45000'),
  database: process.env.DB_NAME, // This will now use 'ecod_af2_pdb'
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
});

/**
 * Execute a database query with proper TypeScript support
 * @param text SQL query string
 * @param params Query parameters
 * @returns Promise<QueryResult<T>> where T is the expected row type
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }

    // Return in our standardized format
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get pool instance for advanced operations (transactions, etc.)
 */
export function getPool(): Pool {
  return pool;
}

/**
 * Execute multiple queries in a transaction
 * @param queries Array of { text, params } objects
 * @returns Promise<QueryResult<any>[]>
 */
export async function transaction(
  queries: Array<{ text: string; params?: any[] }>
): Promise<QueryResult<any>[]> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const results: QueryResult<any>[] = [];

    for (const { text, params } of queries) {
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;

      if (process.env.NODE_ENV !== 'production') {
        console.log('Executed transaction query', { text, duration, rows: result.rowCount });
      }

      results.push({
        rows: result.rows,
        rowCount: result.rowCount || 0
      });
    }

    await client.query('COMMIT');
    return results;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check database connection health
 * @returns Promise<boolean>
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows.length > 0 && result.rows[0].health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get connection pool stats
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
}
