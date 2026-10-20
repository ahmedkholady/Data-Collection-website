import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { checkDatabaseConnection } from '../src/db/healthCheck.js';
import { setPool, isDatabaseConfigured, closePool } from '../src/db/index.js';

describe('Database Connectivity & Readiness Checks', () => {
  afterEach(async () => {
    // Reset any injected mock pool after each test
    setPool(null);
  });

  describe('Unconfigured State (Default Local Environment)', () => {
    test('checkDatabaseConnection reports unconfigured without throwing', async () => {
      // In current workspace, DB env vars are absent
      if (!isDatabaseConfigured()) {
        const result = await checkDatabaseConnection();
        assert.equal(result.ok, false);
        assert.equal(result.status, 'unconfigured');
        assert.equal(result.latencyMs, null);
        assert.match(result.message, /not configured/i);
      }
    });

    test('GET /api/ready returns 503 degraded when database is not configured', async () => {
      if (!isDatabaseConfigured()) {
        const res = await request(app).get('/api/ready');
        assert.equal(res.status, 503);
        assert.equal(res.body.status, 'degraded');
        assert.equal(res.body.database.status, 'unconfigured');
      }
    });
  });

  describe('Mocked Database State (Unit Tests)', () => {
    test('checkDatabaseConnection reports connected when query succeeds', async () => {
      const mockPool = {
        query: async (sql) => {
          assert.equal(sql, 'SELECT 1');
          return { rows: [{ '?column?': 1 }] };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const result = await checkDatabaseConnection();
      assert.equal(result.ok, true);
      assert.equal(result.status, 'connected');
      assert.equal(typeof result.latencyMs, 'number');
    });

    test('GET /api/ready returns 200 ok when database check succeeds', async () => {
      const mockPool = {
        query: async () => ({ rows: [{ '?column?': 1 }] }),
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).get('/api/ready');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.equal(res.body.database.status, 'connected');
      assert.equal(typeof res.body.database.latencyMs, 'number');
    });

    test('GET /api/ready returns 503 degraded when database connection fails', async () => {
      const mockPool = {
        query: async () => {
          throw new Error('Connection refused to postgres:5432');
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).get('/api/ready');
      assert.equal(res.status, 503);
      assert.equal(res.body.status, 'degraded');
      assert.equal(res.body.database.status, 'disconnected');
      assert.match(res.body.database.message, /Connection refused/);
    });
  });

  describe('Live Database Integration Tests (Conditional)', () => {
    test('Live database SELECT 1 query if environment configured', async (t) => {
      if (!isDatabaseConfigured()) {
        t.skip('Skipping live DB test: PostgreSQL environment is not configured in this environment.');
        return;
      }

      // If configured, run non-destructive query
      const result = await checkDatabaseConnection();
      assert.equal(result.ok, true);
      assert.equal(result.status, 'connected');
    });
  });
});
