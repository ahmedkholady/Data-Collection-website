-- ============================================================
-- Migration 001: Required Extensions
-- ============================================================
-- pg_trgm: يوفر GIN/GiST indexes للبحث الجزئي (substring search)
-- في normalized_phone و name_normalized. ده أهم extension في المشروع.
--
-- ملاحظة: على Managed Postgres (RDS, Cloud SQL, Azure...) الـ CREATE
-- EXTENSION محتاج صلاحية superuser أو الدور المخصص لكده (زي rds_superuser
-- على AWS). لو الأمر فشل بسبب صلاحيات، اطلب من الـDBA/الاستضافة تفعيله
-- مرة واحدة بس.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- ============================================================
-- Migration 002: users
-- ============================================================
-- ملاحظة: role عبارة عن نص بسيط (مش جدول roles منفصل) لأن المشروع
-- في مرحلته الأولى محتاج Admin واحد بس. الـCHECK constraint بيمنع
-- قيم غلط بدون ما يحتاج جدول كامل. لو النظام احتاج صلاحيات معقدة
-- مستقبلًا (permissions مختلفة لكل نوع مستخدم)، وقتها نستبدلها بجدول
-- roles + permissions منفصل.
-- ============================================================

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,                       -- bcrypt/argon2 فقط، أبدًا plain text
    role          VARCHAR(20) NOT NULL DEFAULT 'admin'
                  CHECK (role IN ('admin', 'user', 'viewer')),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE users IS 'مستخدمو النظام (Admin/User/Viewer) اللي بيرفعوا الـimports أو يستخدموا الـsearch.';
COMMENT ON COLUMN users.role IS 'بسيط دلوقتي: عمود واحد بدل جدول roles منفصل. قابل للترقية لاحقًا.';
-- ============================================================
-- Migration 003: Lookup / Dimension Tables
-- ============================================================
-- cities / sources / activity_types: قيم محدودة العدد (عشرات لحد
-- مئات) بتتكرر ملايين المرات في contacts. تخزينها كـinteger FK
-- بدل نص بيوفر مساحة تخزين ضخمة مع 35M صف، وبيضمن اتساق القيم
-- (منع "الغربية" و"المنطقة الغربية" كقيمتين مختلفتين لنفس المعنى).
-- ============================================================

CREATE TABLE cities (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE sources (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE activity_types (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(150) NOT NULL UNIQUE
);

COMMENT ON TABLE cities IS 'قائمة المدن/المناطق. Lookup table لتقليل التكرار وضمان الاتساق.';
COMMENT ON TABLE sources IS 'مصادر البيانات (خرائط جوجل، واتساب، يدوي...). Lookup table.';
COMMENT ON TABLE activity_types IS 'أنواع النشاط التجاري. Lookup table.';
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
-- ============================================================
-- Migration 006: contacts (الجدول الرئيسي)
-- ============================================================
-- قرارات مهمة اتخدت هنا وقت التنفيذ (زيادة عن التصميم الأصلي):
--
-- 1) dedup_hash بقى GENERATED COLUMN (STORED) بدل ما يتحسب في الكود:
--    ده معناه إن Postgres نفسه هو اللي بيحسب الـhash تلقائيًا من
--    (normalized_phone + name_normalized + source_id) في كل INSERT.
--    الفايدة: مفيش احتمال إن الـBackend يحسب الـhash بطريقة مختلفة
--    عن قاعدة البيانات (bug شائع لما يبقى فيه منطق مكرر في مكانين).
--    التكلفة: تكلفة حساب بسيطة جدًا وقت الكتابة (مُهمَلة).
--
-- 2) normalized_phone و name_normalized اتسابوا columns عادية (مش
--    generated) لأن قواعد الـnormalization (خصوصًا للأرقام) لسه
--    محتاجة تأكيد من العميل (راجع الأسئلة في المستند). الـBackend
--    هو اللي هيحسبهم وقت الـimport ويحطهم هنا.
-- ============================================================

CREATE TABLE contacts (
    id                BIGSERIAL PRIMARY KEY,

    original_phone    VARCHAR(25) NOT NULL,
    normalized_phone  VARCHAR(15) NOT NULL,

    name              VARCHAR(255) NOT NULL,
    name_normalized   VARCHAR(255) NOT NULL,

    city_id           INTEGER REFERENCES cities(id),
    source_id         INTEGER REFERENCES sources(id),
    activity_type_id  INTEGER REFERENCES activity_types(id),

    import_batch_id   BIGINT NOT NULL REFERENCES import_batches(id),

    dedup_hash CHAR(32) GENERATED ALWAYS AS (
        md5(normalized_phone || '|' || name_normalized || '|' || COALESCE(source_id::text, ''))
    ) STORED,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_contacts_dedup UNIQUE (dedup_hash)
);

COMMENT ON TABLE contacts IS 'الجدول الرئيسي (fact table). كل صف = ظهور رقم هاتف مرتبط باسم/مصدر/مدينة/نشاط.';
COMMENT ON COLUMN contacts.original_phone IS 'الرقم زي ما جه من المصدر، بدون تعديل — للعرض والـaudit.';
COMMENT ON COLUMN contacts.normalized_phone IS 'الرقم بعد التوحيد (format موحد) — يُستخدم في البحث والمقارنة والـdedup.';
COMMENT ON COLUMN contacts.dedup_hash IS 'محسوب تلقائيًا من (normalized_phone + name_normalized + source_id). لو نفس القيم اتكررت، الـINSERT هيفشل بسبب UNIQUE constraint (استخدم ON CONFLICT DO NOTHING وقت الـimport).';
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
