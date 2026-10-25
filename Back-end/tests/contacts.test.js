import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { setPool } from '../src/db/index.js';
import { normalizePhone, normalizeName } from '../src/utils/normalize.js';

describe('Contacts API (Jimmy)', () => {
  afterEach(() => {
    setPool(null);
  });

  describe('Task 1: Phone and Name Normalization Utilities', () => {
    test('normalizePhone formats Egyptian numbers correctly', () => {
      assert.equal(normalizePhone('+201012345678'), '01012345678');
      assert.equal(normalizePhone('00201198765432'), '01198765432');
      assert.equal(normalizePhone('٠١٢٣٤٥٦٧٨٩٠'), '01234567890');
      assert.equal(normalizePhone('010 - 1234 - 5678'), '01012345678');
    });

    test('normalizeName cleans Arabic text and unifies letters', () => {
      assert.equal(normalizeName('مُحَمَّدْ'), 'محمد');
      assert.equal(normalizeName('أحمد إبراهيم'), 'احمد ابراهيم');
      assert.equal(normalizeName('فاطمة الشركة'), 'فاطمه الشركه');
      assert.equal(normalizeName('مصطفى'), 'مصطفي');
      assert.equal(normalizeName('  محمود   علي  '), 'محمود علي');
    });
  });

  describe('Task 1: POST /api/contacts - Add Contact', () => {
    test('fails when required fields are missing', async () => {
      const res = await request(app).post('/api/contacts').send({});
      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'error');
      assert.equal(res.body.message, 'Request validation failed');
      assert.ok(res.body.errors.body.some((e) => e.field === 'phone'));
      assert.ok(res.body.errors.body.some((e) => e.field === 'name'));
    });

    test('fails when phone is too short', async () => {
      const res = await request(app).post('/api/contacts').send({
        phone: '123',
        name: 'أحمد',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'error');
    });

    test('successfully creates a new contact (201 Created)', async () => {
      const mockContact = {
        id: '1',
        original_phone: '01012345678',
        normalized_phone: '01012345678',
        name: 'أحمد محمود',
        name_normalized: 'احمد محمود',
        city_id: 1,
        source_id: 2,
        activity_type_id: null,
        import_batch_id: '99',
        dedup_hash: 'mockhash123',
        created_at: new Date().toISOString(),
      };

      const mockPool = {
        query: async (sql, values) => {
          if (sql.includes('SELECT id FROM import_batches')) {
            return { rows: [{ id: '99' }] };
          }
          if (sql.includes('INSERT INTO contacts')) {
            return { rows: [mockContact] };
          }
          return { rows: [] };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).post('/api/contacts').send({
        phone: '01012345678',
        name: 'أحمد محمود',
        city_id: 1,
        source_id: 2,
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.id, '1');
      assert.equal(res.body.data.name_normalized, 'احمد محمود');
    });

    test('handles duplicate record and returns 409 Conflict', async () => {
      const mockPool = {
        query: async (sql) => {
          if (sql.includes('SELECT id FROM import_batches')) {
            return { rows: [{ id: '99' }] };
          }
          if (sql.includes('INSERT INTO contacts')) {
            const err = new Error('duplicate key value violates unique constraint "uq_contacts_dedup"');
            err.code = '23505';
            throw err;
          }
          return { rows: [] };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).post('/api/contacts').send({
        phone: '01012345678',
        name: 'أحمد محمود',
      });

      assert.equal(res.status, 409);
      assert.equal(res.body.status, 'error');
      assert.match(res.body.message, /مسجل مسبقاً/);
    });
  });

  describe('Task 2: GET /api/contacts - List Contacts & Pagination', () => {
    test('returns paginated contacts list and metadata', async () => {
      const mockRows = [
        {
          id: '1',
          original_phone: '01012345678',
          normalized_phone: '01012345678',
          name: 'عمرو خالد',
          name_normalized: 'عمرو خالد',
          city_id: 1,
          city_name: 'القاهرة',
          source_id: 1,
          source_name: 'فيسبوك',
          activity_type_id: null,
          activity_type_name: null,
          full_count: '150',
        },
      ];

      const mockPool = {
        query: async (sql, values) => {
          assert.ok(sql.includes('FROM contacts'));
          assert.ok(sql.includes('LIMIT'));
          return { rows: mockRows };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).get('/api/contacts?page=1&limit=50');

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].name, 'عمرو خالد');
      assert.equal(res.body.data[0].city_name, 'القاهرة');
      assert.equal(res.body.pagination.total, 150);
      assert.equal(res.body.pagination.page, 1);
      assert.equal(res.body.pagination.limit, 50);
      assert.equal(res.body.pagination.totalPages, 3);
    });

    test('supports searching by name or phone', async () => {
      let executedSql = '';
      let executedValues = [];

      const mockPool = {
        query: async (sql, values) => {
          executedSql = sql;
          executedValues = values;
          return { rows: [] };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).get('/api/contacts?search=010123');

      assert.equal(res.status, 200);
      assert.ok(executedSql.includes('contacts.normalized_phone LIKE'));
      assert.ok(executedValues.some((v) => v.includes('010123')));
    });

    test('returns empty data when no records found', async () => {
      const mockPool = {
        query: async () => ({ rows: [] }),
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).get('/api/contacts');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body.data, []);
      assert.equal(res.body.pagination.total, 0);
    });
  });

  describe('Task 2: GET /api/contacts/:id - Contact Details', () => {
    test('returns contact details when ID exists (200 OK)', async () => {
      const mockContact = {
        id: '42',
        original_phone: '01299998888',
        normalized_phone: '01299998888',
        name: 'سارة إبراهيم',
        name_normalized: 'ساره ابراهيم',
        city_id: 2,
        city_name: 'الجيزة',
        source_id: 3,
        source_name: 'واتساب',
        activity_type_id: 1,
        activity_type_name: 'عقارات',
      };

      const mockPool = {
        query: async (sql, values) => {
          assert.equal(values[0], 42);
          return { rows: [mockContact] };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).get('/api/contacts/42');

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.id, '42');
      assert.equal(res.body.data.name, 'سارة إبراهيم');
      assert.equal(res.body.data.city_name, 'الجيزة');
    });

    test('returns 404 when contact is not found', async () => {
      const mockPool = {
        query: async () => ({ rows: [] }),
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).get('/api/contacts/99999');

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'error');
      assert.match(res.body.message, /غير موجودة/);
    });

    test('fails validation when ID is not a positive number', async () => {
      const res = await request(app).get('/api/contacts/invalid-id');
      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'error');
    });
  });

  describe('Task 3: PUT /api/contacts/:id - Update Contact', () => {
    test('successfully updates a contact (200 OK)', async () => {
      const existingContact = {
        id: '10',
        original_phone: '01011112222',
        name: 'كريم أحمد',
      };

      const updatedContact = {
        id: '10',
        original_phone: '01099998888',
        normalized_phone: '01099998888',
        name: 'كريم محمود',
        name_normalized: 'كريم محمود',
      };

      const mockPool = {
        query: async (sql) => {
          if (sql.includes('SELECT') && sql.includes('contacts.id = $1')) {
            return { rows: [existingContact] };
          }
          if (sql.includes('UPDATE contacts')) {
            return { rows: [updatedContact] };
          }
          return { rows: [] };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).put('/api/contacts/10').send({
        phone: '01099998888',
        name: 'كريم محمود',
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.original_phone, '01099998888');
      assert.equal(res.body.data.name_normalized, 'كريم محمود');
    });

    test('returns 404 when updating non-existent contact', async () => {
      const mockPool = {
        query: async () => ({ rows: [] }),
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).put('/api/contacts/9999').send({
        name: 'اسم تجريبي',
      });

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'error');
    });

    test('returns 400 when body has no fields to update', async () => {
      const res = await request(app).put('/api/contacts/10').send({});
      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'error');
    });

    test('returns 409 when update causes duplicate constraint violation', async () => {
      const existingContact = { id: '10', original_phone: '01011112222', name: 'كريم أحمد' };

      const mockPool = {
        query: async (sql) => {
          if (sql.includes('SELECT') && sql.includes('contacts.id = $1')) {
            return { rows: [existingContact] };
          }
          if (sql.includes('UPDATE contacts')) {
            const err = new Error('duplicate key');
            err.code = '23505';
            throw err;
          }
          return { rows: [] };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).put('/api/contacts/10').send({
        phone: '01099998888',
      });

      assert.equal(res.status, 409);
      assert.equal(res.body.status, 'error');
      assert.match(res.body.message, /يتعارض مع سجل آخر/);
    });
  });

  describe('Task 3: DELETE /api/contacts/:id - Delete Contact', () => {
    test('successfully deletes a contact (200 OK)', async () => {
      const mockPool = {
        query: async (sql, values) => {
          assert.ok(sql.includes('DELETE FROM contacts WHERE id = $1'));
          assert.equal(values[0], 15);
          return { rows: [{ id: 15 }] };
        },
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).delete('/api/contacts/15');

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.match(res.body.message, /تم حذف جهة الاتصال بنجاح/);
    });

    test('returns 404 when deleting non-existent contact', async () => {
      const mockPool = {
        query: async () => ({ rows: [] }),
        end: async () => {},
      };

      setPool(mockPool);

      const res = await request(app).delete('/api/contacts/8888');

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'error');
      assert.match(res.body.message, /غير موجودة/);
    });

    test('fails validation when deleting with non-numeric ID', async () => {
      const res = await request(app).delete('/api/contacts/abc');
      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'error');
    });
  });
});
