import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import app from '../src/app.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';

describe('Express Foundation & HTTP Endpoints', () => {
  test('GET /api/health returns 200 and matches frontend contract { status: "ok" }', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(typeof res.body.uptime, 'number');
    assert.ok(res.body.timestamp);
  });

  test('Unknown route returns standard JSON 404 response', async () => {
    const res = await request(app).get('/api/nonexistent-route-12345');

    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
    assert.match(res.body.message, /Route not found/);
  });

  test('Error handling in production does not leak internal stack traces', async () => {
    const testApp = express();
    testApp.use(express.json());

    // Route that simulates an unhandled internal exception
    testApp.get('/throw-error', () => {
      throw new Error('Secret internal database details that must not leak');
    });

    testApp.use(errorHandler);

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const res = await request(testApp).get('/throw-error');

      assert.equal(res.status, 500);
      assert.equal(res.body.status, 'error');
      assert.equal(res.body.message, 'Internal Server Error');
      assert.equal(res.body.stack, undefined, 'Stack trace must not be exposed in production');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test('Malformed JSON payload returns 400 with clean JSON error', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{ "malformedJson": ');

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.match(res.body.message, /Malformed JSON/);
  });
});
