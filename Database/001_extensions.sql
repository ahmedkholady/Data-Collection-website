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
