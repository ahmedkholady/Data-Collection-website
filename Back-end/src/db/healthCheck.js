import { isDatabaseConfigured, query } from './index.js';

/**
 * Checks database connectivity by executing a lightweight SELECT 1.
 * Returns connection metrics and handles missing configuration or connection errors cleanly.
 */
export async function checkDatabaseConnection() {
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      status: 'unconfigured',
      message: 'Database connection parameters are not configured in environment variables',
      latencyMs: null,
    };
  }

  const startTime = Date.now();
  try {
    await query('SELECT 1');
    const latencyMs = Date.now() - startTime;
    return {
      ok: true,
      status: 'connected',
      latencyMs,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'disconnected',
      message: err.message || 'Failed to connect to database',
      latencyMs: null,
    };
  }
}

export default checkDatabaseConnection;
