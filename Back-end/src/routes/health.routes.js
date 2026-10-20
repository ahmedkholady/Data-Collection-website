import { Router } from 'express';
import { checkDatabaseConnection } from '../db/healthCheck.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

/**
 * Basic liveness check.
 * Preserves the exact frontend contract: responds with status: 'ok'.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Service readiness check.
 * Verifies database connectivity using a lightweight query.
 * Responds with HTTP 200 if database is reachable, or HTTP 503 if disconnected/unconfigured.
 */
router.get(
  ['/ready', '/health/ready'],
  asyncHandler(async (req, res) => {
    const dbStatus = await checkDatabaseConnection();
    const isReady = dbStatus.ok;
    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      status: isReady ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  })
);

export default router;
