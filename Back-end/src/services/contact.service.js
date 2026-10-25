import { query } from '../db/index.js';
import { normalizePhone, normalizeName } from '../utils/normalize.js';
import { AppError, BadRequestError, NotFoundError } from '../utils/errors.js';

let cachedManualBatchId = null;

/**
 * Retrieves or creates a default import batch for manual entries.
 * Necessary because import_batch_id has a NOT NULL constraint on contacts.
 */
async function getOrCreateManualBatchId() {
  if (cachedManualBatchId) {
    return cachedManualBatchId;
  }

  const checkRes = await query(
    `SELECT id FROM import_batches WHERE file_name = 'MANUAL_ENTRY' LIMIT 1`
  );

  if (checkRes.rows.length > 0) {
    cachedManualBatchId = checkRes.rows[0].id;
    return cachedManualBatchId;
  }

  const createRes = await query(
    `INSERT INTO import_batches (file_name, status, total_rows, success_count)
     VALUES ('MANUAL_ENTRY', 'completed', 0, 0)
     RETURNING id`
  );

  cachedManualBatchId = createRes.rows[0].id;
  return cachedManualBatchId;
}

/**
 * Task 1: Create a single contact record
 */
export async function createContact({
  phone,
  name,
  city_id = null,
  source_id = null,
  activity_type_id = null,
}) {
  const original_phone = phone.trim();
  const normalized_phone = normalizePhone(original_phone);
  const contactName = name.trim();
  const name_normalized = normalizeName(contactName);

  if (!normalized_phone) {
    throw new BadRequestError('رقم الهاتف غير صالح بعد التنقية');
  }

  if (!name_normalized) {
    throw new BadRequestError('الاسم غير صالح بعد التنقية');
  }

  const import_batch_id = await getOrCreateManualBatchId();

  const insertSql = `
    INSERT INTO contacts (
      original_phone,
      normalized_phone,
      name,
      name_normalized,
      city_id,
      source_id,
      activity_type_id,
      import_batch_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, original_phone, normalized_phone, name, name_normalized,
              city_id, source_id, activity_type_id, import_batch_id, dedup_hash, created_at;
  `;

  const values = [
    original_phone,
    normalized_phone,
    contactName,
    name_normalized,
    city_id || null,
    source_id || null,
    activity_type_id || null,
    import_batch_id,
  ];

  try {
    const result = await query(insertSql, values);
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('هذا السجل مسجل مسبقاً بنفس الرقم والاسم والمصدر', 409);
    }
    if (err.code === '23503') {
      throw new BadRequestError('المدينة أو المصدر أو نوع النشاط المختار غير صحيح');
    }
    throw err;
  }
}

/**
 * Task 2, 4, 5: Get paginated list of contacts with search and filters
 */
export async function getContacts({
  page = 1,
  limit = 50,
  search,
  city_id,
  source_id,
  activity_type_id,
  sortBy = 'created_at',
  sortOrder = 'DESC',
}) {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (search && search.trim()) {
    const trimmedSearch = search.trim();
    const normalizedSearchName = normalizeName(trimmedSearch);
    const normalizedSearchPhone = normalizePhone(trimmedSearch);

    const searchClauses = [];

    if (normalizedSearchName) {
      searchClauses.push(`contacts.name_normalized LIKE $${paramIndex}`);
      values.push(`%${normalizedSearchName}%`);
      paramIndex++;
    }

    if (normalizedSearchPhone) {
      searchClauses.push(`contacts.normalized_phone LIKE $${paramIndex}`);
      values.push(`%${normalizedSearchPhone}%`);
      paramIndex++;
    }

    if (searchClauses.length > 0) {
      conditions.push(`(${searchClauses.join(' OR ')})`);
    }
  }

  if (city_id) {
    conditions.push(`contacts.city_id = $${paramIndex}`);
    values.push(city_id);
    paramIndex++;
  }

  if (source_id) {
    conditions.push(`contacts.source_id = $${paramIndex}`);
    values.push(source_id);
    paramIndex++;
  }

  if (activity_type_id) {
    conditions.push(`contacts.activity_type_id = $${paramIndex}`);
    values.push(activity_type_id);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    created_at: 'contacts.created_at',
    name: 'contacts.name',
    normalized_phone: 'contacts.normalized_phone',
    id: 'contacts.id',
  };
  const safeSortColumn = allowedSortColumns[sortBy] || 'contacts.created_at';
  const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;

  const sql = `
    SELECT
      contacts.id,
      contacts.original_phone,
      contacts.normalized_phone,
      contacts.name,
      contacts.name_normalized,
      contacts.city_id,
      c.name AS city_name,
      contacts.source_id,
      s.name AS source_name,
      contacts.activity_type_id,
      a.name AS activity_type_name,
      contacts.import_batch_id,
      contacts.created_at,
      COUNT(*) OVER() AS full_count
    FROM contacts
    LEFT JOIN cities c ON contacts.city_id = c.id
    LEFT JOIN sources s ON contacts.source_id = s.id
    LEFT JOIN activity_types a ON contacts.activity_type_id = a.id
    ${whereClause}
    ORDER BY ${safeSortColumn} ${safeSortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  values.push(limit, offset);

  const result = await query(sql, values);

  if (result.rows.length === 0) {
    return {
      data: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }

  const total = parseInt(result.rows[0].full_count, 10);
  const totalPages = Math.ceil(total / limit);

  const data = result.rows.map(({ full_count, ...contact }) => contact);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

/**
 * Task 2: Get a single contact details by ID
 */
export async function getContactById(id) {
  const sql = `
    SELECT
      contacts.id,
      contacts.original_phone,
      contacts.normalized_phone,
      contacts.name,
      contacts.name_normalized,
      contacts.city_id,
      c.name AS city_name,
      contacts.source_id,
      s.name AS source_name,
      contacts.activity_type_id,
      a.name AS activity_type_name,
      contacts.import_batch_id,
      contacts.created_at
    FROM contacts
    LEFT JOIN cities c ON contacts.city_id = c.id
    LEFT JOIN sources s ON contacts.source_id = s.id
    LEFT JOIN activity_types a ON contacts.activity_type_id = a.id
    WHERE contacts.id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [id]);

  if (result.rows.length === 0) {
    throw new NotFoundError('جهة الاتصال غير موجودة');
  }

  return result.rows[0];
}

/**
 * Task 3: Update an existing contact record
 */
export async function updateContact(id, updates) {
  // First ensure contact exists
  await getContactById(id);

  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  if (updates.phone !== undefined) {
    const original_phone = updates.phone.trim();
    const normalized_phone = normalizePhone(original_phone);
    if (!normalized_phone) {
      throw new BadRequestError('رقم الهاتف الجديد غير صالح بعد التنقية');
    }
    setClauses.push(`original_phone = $${paramIndex}`);
    values.push(original_phone);
    paramIndex++;

    setClauses.push(`normalized_phone = $${paramIndex}`);
    values.push(normalized_phone);
    paramIndex++;
  }

  if (updates.name !== undefined) {
    const contactName = updates.name.trim();
    const name_normalized = normalizeName(contactName);
    if (!name_normalized) {
      throw new BadRequestError('الاسم الجديد غير صالح بعد التنقية');
    }
    setClauses.push(`name = $${paramIndex}`);
    values.push(contactName);
    paramIndex++;

    setClauses.push(`name_normalized = $${paramIndex}`);
    values.push(name_normalized);
    paramIndex++;
  }

  if (updates.city_id !== undefined) {
    setClauses.push(`city_id = $${paramIndex}`);
    values.push(updates.city_id || null);
    paramIndex++;
  }

  if (updates.source_id !== undefined) {
    setClauses.push(`source_id = $${paramIndex}`);
    values.push(updates.source_id || null);
    paramIndex++;
  }

  if (updates.activity_type_id !== undefined) {
    setClauses.push(`activity_type_id = $${paramIndex}`);
    values.push(updates.activity_type_id || null);
    paramIndex++;
  }

  if (setClauses.length === 0) {
    throw new BadRequestError('لم يتم تقديم أي حقول لتحديثها');
  }

  values.push(id);
  const sql = `
    UPDATE contacts
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, original_phone, normalized_phone, name, name_normalized,
              city_id, source_id, activity_type_id, import_batch_id, dedup_hash, created_at;
  `;

  try {
    const result = await query(sql, values);
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('تعديل البيانات يتعارض مع سجل آخر مسجل مسبقاً بنفس الرقم والاسم والمصدر', 409);
    }
    if (err.code === '23503') {
      throw new BadRequestError('المدينة أو المصدر أو نوع النشاط المختار غير صحيح');
    }
    throw err;
  }
}

/**
 * Task 3: Delete a contact record by ID
 */
export async function deleteContact(id) {
  const sql = `DELETE FROM contacts WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);

  if (result.rows.length === 0) {
    throw new NotFoundError('جهة الاتصال غير موجودة أو تم حذفها مسبقاً');
  }

  return { id: result.rows[0].id };
}

export default {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
};
