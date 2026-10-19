-- ============================================================
-- Rollback: يحذف كل الجداول بترتيب عكسي آمن (يحترم الـForeign Keys)
-- استخدمه بس وقت التطوير/الاختبار. لا تشغله على بيانات حقيقية إلا
-- وانت متأكد 100%.
-- ============================================================

DROP TABLE IF EXISTS import_errors CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS import_batches CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS activity_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
