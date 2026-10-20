import pg from 'pg';
import { getDbPoolConfig, isDatabaseConfigured as checkEnvConfigured } from '../config/env.js';

const { Pool } = pg;

let poolInstance = null;

/**
 * Lazily obtains or creates the PostgreSQL connection pool.
 * Does not attempt to connect on import, allowing test suites and other modules
 * to run even if the database is not yet running or configured.
 */
export function getPool() {
  if (poolInstance) {
    return poolInstance;
  }

  const poolConfig = getDbPoolConfig();
  poolInstance = new Pool(poolConfig);

  poolInstance.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
  });

  return poolInstance;
}

/**
 * Helper to execute a query against the pool.
 */
export async function query(text, params) {
  const pool = getPool();
  return pool.query(text, params);
}

/**
 * Obtains a single client from the pool for transactions.
 */
export async function getClient() {
  const pool = getPool();
  return pool.connect();
}

/**
 * Gracefully drains the connection pool.
 */
export async function closePool() {
  if (poolInstance) {
    const currentPool = poolInstance;
    poolInstance = null;
    await currentPool.end();
  }
}

/**
 * Allows injecting a mock pool for testing.
 */
export function setPool(customPool) {
  poolInstance = customPool;
}

/**
 * Checks if database credentials are configured or a pool has been explicitly initialized.
 */
export function isDatabaseConfigured() {
  if (poolInstance) {
    return true;
  }
  return checkEnvConfigured();
}
export default {
  getPool,
  query,
  getClient,
  closePool,
  setPool,
  isDatabaseConfigured,
};
