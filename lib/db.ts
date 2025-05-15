// lib/db.ts (enhanced)
import { Pool, PoolClient } from 'pg';

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'ecod_af2_pdb',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Increase max clients for higher concurrency
  max: 20,
  // Idle timeout
  idleTimeoutMillis: 30000,
  // Connection timeout
  connectionTimeoutMillis: 2000
});

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Simple query function
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > 100) {
      console.log('Slow query:', { text, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Function for transactions or multiple queries
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
