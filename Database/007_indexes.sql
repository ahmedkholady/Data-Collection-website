-- ============================================================
-- Migration 007: Index Strategy
-- ============================================================
-- كل Index هنا مبني على Query فعلية محددة في المستند. مفيش index
-- عشوائي على كل عمود.
-- ============================================================

-- 1) بحث بالرقم الكامل + prefix search (LIKE 'X%')
--    varchar_pattern_ops بيضمن إن الـLIKE 'X%' يستخدم الـindex حتى
--    لو الـcollation بتاع الداتابيز مش C.
CREATE INDEX idx_contacts_phone_btree
    ON contacts (normalized_phone varchar_pattern_ops);

-- 2) بحث جزئي (substring — الرقم في أي مكان) — يحتاج pg_trgm
CREATE INDEX idx_contacts_phone_trgm
    ON contacts USING GIN (normalized_phone gin_trgm_ops);

-- 3) بحث جزئي بالاسم (substring)
CREATE INDEX idx_contacts_name_trgm
    ON contacts USING GIN (name_normalized gin_trgm_ops);

-- 4) فلترة بالمدينة / المصدر / نوع النشاط (منفصلين، مش composite —
--    راجع Phase 6 في المستند لسبب اختيار Bitmap AND بدل composite ثابت)
CREATE INDEX idx_contacts_city_id ON contacts (city_id);
CREATE INDEX idx_contacts_source_id ON contacts (source_id);
CREATE INDEX idx_contacts_activity_type_id ON contacts (activity_type_id);

-- 5) دعم rollback / قراءة كل سجلات batch معين بسرعة
CREATE INDEX idx_contacts_import_batch_id ON contacts (import_batch_id);

-- 6) دعم استعلامات import_errors حسب الـbatch
CREATE INDEX idx_import_errors_batch_id ON import_errors (import_batch_id);

-- ملاحظة: dedup_hash عنده UNIQUE constraint بالفعل من Migration 006،
-- وده بيبني index تلقائيًا (منفصل عن الـindexes دي).
