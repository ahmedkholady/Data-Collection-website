-- ============================================================
-- Migration 004: import_batches
-- ============================================================
-- كل عملية رفع CSV بتتسجل هنا: مين رفع، إمتى، حالة العملية، وملخص
-- النتائج (نجح/فشل/duplicate). ده بيوفر:
--   1) Traceability كاملة لمصدر كل دفعة بيانات
--   2) Rollback بسيط: DELETE FROM contacts WHERE import_batch_id = X
--   3) الـImport Summary المطلوب عرضه للمستخدم بعد كل رفع
-- ============================================================

CREATE TABLE import_batches (
    id               BIGSERIAL PRIMARY KEY,
    file_name        VARCHAR(255) NOT NULL,
    uploaded_by      BIGINT REFERENCES users(id),
    total_rows       INTEGER,
    success_count    INTEGER NOT NULL DEFAULT 0,
    failed_count     INTEGER NOT NULL DEFAULT 0,
    duplicate_count  INTEGER NOT NULL DEFAULT 0,
    status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    started_at       TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE import_batches IS 'سجل كل عملية استيراد CSV: مين رفع، إمتى، النتيجة، وحالة العملية (لدعم الـrollback والـaudit).';
