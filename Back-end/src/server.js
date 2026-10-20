import app from './app.js';
import { env } from './config/env.js';
import { closePool } from './db/index.js';

const server = app.listen(env.PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

let isShuttingDown = false;

/**
 * Handles graceful shutdown by first stopping HTTP ingress,
 * then draining the PostgreSQL connection pool.
 */
async function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\nReceived ${signal}. Closing HTTP server...`);

  const forceTimeout = setTimeout(() => {
    console.error('Graceful shutdown timed out after 10s. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceTimeout.unref();

  server.close(async (closeErr) => {
    if (closeErr) {
      console.error('Error while closing HTTP server:', closeErr.message);
    } else {
      console.log('HTTP server successfully closed.');
    }

    try {
      await closePool();
      console.log('PostgreSQL connection pool closed.');
    } catch (poolErr) {
      console.error('Error while closing PostgreSQL pool:', poolErr.message);
    }

    process.exit(closeErr ? 1 : 0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
