import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import { z } from 'zod';
import { validate } from '../src/middlewares/validate.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';

describe('Validation Middleware (Zod)', () => {
  const setupTestApp = () => {
    const app = express();
    app.use(express.json());

    // Schema validating body
    const bodySchema = z.object({
      phone: z.string().min(5, 'Phone must be at least 5 characters'),
      name: z.string().min(1, 'Name is required'),
    });

    app.post(
      '/test-validate-body',
      validate(bodySchema),
      (req, res) => {
        res.status(200).json({ status: 'success', data: req.body });
      }
    );

    // Schema validating both query and body
    const queryAndBodySchema = {
      query: z.object({
        page: z.coerce.number().int().positive().default(1),
      }),
      body: z.object({
        source: z.string().min(1),
      }),
    };

    app.post(
      '/test-validate-composite',
      validate(queryAndBodySchema),
      (req, res) => {
        res.status(200).json({
          status: 'success',
          query: req.query,
          body: req.body,
        });
      }
    );

    app.use(errorHandler);
    return app;
  };

  test('Validation fails when required body fields are missing', async () => {
    const app = setupTestApp();
    const res = await request(app)
      .post('/test-validate-body')
      .send({ phone: '123' }); // missing name, phone too short

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.match(res.body.message, /validation failed/i);
    assert.ok(res.body.errors);
    assert.ok(Array.isArray(res.body.errors.body));
    assert.equal(res.body.errors.body.length, 2);
  });

  test('Validation succeeds when body matches schema', async () => {
    const app = setupTestApp();
    const res = await request(app)
      .post('/test-validate-body')
      .send({ phone: '01012345678', name: 'Ahmed' });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.name, 'Ahmed');
  });

  test('Validation coerces query parameters and validates body', async () => {
    const app = setupTestApp();
    const res = await request(app)
      .post('/test-validate-composite?page=3')
      .send({ source: 'manual' });

    assert.equal(res.status, 200);
    assert.equal(res.body.query.page, 3);
    assert.equal(res.body.body.source, 'manual');
  });

  test('Validation fails on invalid query parameter type', async () => {
    const app = setupTestApp();
    const res = await request(app)
      .post('/test-validate-composite?page=invalid-number')
      .send({ source: 'manual' });

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.query);
  });
});
