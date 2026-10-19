-- ============================================================
-- Migration 005: import_errors
-- ============================================================
-- تفاصيل كل صف فشل خلال import معين، عشان نقدر نعرض للمستخدم سبب
-- الفشل (بدل ما يعرف بس "200 صف فشلوا" بدون تفاصيل).
-- raw_data كـJSONB عشان نحتفظ بالصف الخام زي ما جه من الملف، أيًا
-- كان شكل أعمدته.
-- ============================================================

CREATE TABLE import_errors (
    id              BIGSERIAL PRIMARY KEY,
    import_batch_id BIGINT NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
    row_number      INTEGER,
    raw_data        JSONB,
    error_reason    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE import_errors IS 'الصفوف اللي فشلت أثناء import معين، مع السبب والبيانات الخام.';
