# Migration Files — Database Setup

## المحتوى

| الملف | الوصف |
|---|---|
| `001_extensions.sql` | تفعيل `pg_trgm` (ضروري للبحث الجزئي) |
| `002_users.sql` | جدول المستخدمين |
| `003_lookup_tables.sql` | `cities`, `sources`, `activity_types` |
| `004_import_batches.sql` | تتبع عمليات الاستيراد |
| `005_import_errors.sql` | تفاصيل الصفوف الفاشلة |
| `006_contacts.sql` | الجدول الرئيسي (fact table) |
| `007_indexes.sql` | كل الـIndexes (btree + trigram) |
| `000_full_schema.sql` | كل الملفات فوق مجمّعة في ملف واحد، بنفس الترتيب |
| `999_rollback.sql` | حذف كل شيء (للتطوير فقط) |

## طريقة التشغيل

### تشغيل سريع (كل حاجة مرة واحدة)

```bash
psql -h <host> -U <user> -d <database> -f 000_full_schema.sql
```

### تشغيل ملف بملف (لو عايز تتحكم في الترتيب أو تراجع كل خطوة)

```bash
for f in 001_extensions.sql 002_users.sql 003_lookup_tables.sql \
         004_import_batches.sql 005_import_errors.sql 006_contacts.sql \
         007_indexes.sql; do
  psql -h <host> -U <user> -d <database> -f "$f"
done
```

## متطلبات مهمة قبل التشغيل

1. **صلاحية `CREATE EXTENSION`**: أول ملف (`001_extensions.sql`) محتاج صلاحية superuser
   (أو دور مخصص زي `rds_superuser` على AWS RDS). لو مستضاف على Managed Postgres،
   اطلب من مزود الاستضافة يفعّل `pg_trgm` مرة واحدة لو الأمر فشل بسبب صلاحيات.

2. **صلاحية `CREATE` على schema `public`**: بعض إصدارات Postgres (16+) بتمنع
   المستخدمين العاديين من عمل `CREATE TABLE` في `public` افتراضيًا. لو ظهر
   خطأ `permission denied for schema public`، شغّل مرة واحدة (كـsuperuser):
   ```sql
   GRANT ALL ON SCHEMA public TO <your_app_user>;
   ```

## اتحققنا من إيه فعليًا (تم اختباره)

اتشغلت الـmigrations دي فعليًا على PostgreSQL 16 واتعمل عليها:

- ✅ الـSchema كامل بيتنفذ من غير أي error.
- ✅ Duplicate detection: إدخال نفس (الرقم + الاسم + المصدر) مرتين تاني
  بيترفض تلقائيًا عبر `dedup_hash` UNIQUE constraint (استخدم
  `ON CONFLICT (dedup_hash) DO NOTHING` في كود الـimport).
- ✅ نفس الرقم بأسماء/مصادر مختلفة بيتقبل عادي كسجلين منفصلين (زي ما هو متفق عليه).
- ✅ اختُبر الأداء على **200,000 سجل تجريبي**:
  - substring search بالرقم (`LIKE '%X%'`) → استخدم `idx_contacts_phone_trgm` فعليًا (~3ms)
  - prefix search بالرقم (`LIKE 'X%'`) → استخدم `idx_contacts_phone_btree` فعليًا (~7ms)
  - substring search بالاسم → استخدم `idx_contacts_name_trgm` فعليًا (~11ms)

> **ملاحظة مهمة عن city_id/source_id/activity_type_id indexes**: لاحظت وقت
> الاختبار إن الـPlanner أحيانًا بيتجاهل الـindex على `city_id` ويعمل Seq Scan
> بدل Index Scan. ده **سلوك صحيح وليس bug** — بيحصل لما القيمة اللي بتفلتر
> بيها موجودة في نسبة كبيرة من الجدول (مثلاً 50% من الصفوف)، ووقتها قراءة
> الجدول كله فعليًا أسرع من القفز بين الـindex والـheap. مع بياناتك الحقيقية
> (عدد مدن محدود موزع على ملايين الصفوف) الـselectivity هتبقى مختلفة، والـ
> Planner هيقرر بنفسه الأفضل في كل حالة — مفيش حاجة تتغير في التصميم.

## الخطوة التالية

الملفات دي بتغطي الـSchema بس. لسه ناقص (خارج نطاق الـmigrations):
- منطق الـPhone Normalization في كود الـBackend (القواعد لسه محتاجة تأكيد من العميل).
- CSV Import pipeline (staging table → validation → insert).
- طبقة الـAPI/Backend للبحث والفلترة والـPagination.

قولّي لو عايز نبدأ في أي جزء من دول.
