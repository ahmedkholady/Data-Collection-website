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
