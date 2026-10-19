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
