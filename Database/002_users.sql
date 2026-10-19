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
