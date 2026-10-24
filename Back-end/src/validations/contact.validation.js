import { z } from 'zod';

/**
 * Validation schema for creating a new contact (Task 1)
 */
export const createContactSchema = z.object({
  phone: z
    .string({ required_error: 'رقم الهاتف مطلوب' })
    .min(6, 'رقم الهاتف قصير جداً')
    .max(25, 'رقم الهاتف طويل جداً'),
  name: z
    .string({ required_error: 'الاسم مطلوب' })
    .trim()
    .min(1, 'الاسم لا يمكن أن يكون فارغاً')
    .max(255, 'الاسم طويل جداً (الحد الأقصى 255 حرف)'),
  city_id: z.coerce.number().int().positive().nullable().optional(),
  source_id: z.coerce.number().int().positive().nullable().optional(),
  activity_type_id: z.coerce.number().int().positive().nullable().optional(),
});

/**
 * Validation schema for updating a contact (Task 3)
 */
export const updateContactSchema = z
  .object({
    phone: z.string().min(6, 'رقم الهاتف قصير جداً').max(25, 'رقم الهاتف طويل جداً').optional(),
    name: z.string().trim().min(1, 'الاسم لا يمكن أن يكون فارغاً').max(255).optional(),
    city_id: z.coerce.number().int().positive().nullable().optional(),
    source_id: z.coerce.number().int().positive().nullable().optional(),
    activity_type_id: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'يجب إرسال حقل واحد على الأقل للتعديل',
  });

/**
 * Validation schema for querying contacts list (Task 2, 4, 5)
 */
export const queryContactsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().trim().optional(),
  city_id: z.coerce.number().int().positive().optional(),
  source_id: z.coerce.number().int().positive().optional(),
  activity_type_id: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['created_at', 'name', 'normalized_phone', 'id']).default('created_at'),
  sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('DESC'),
});

/**
 * Validation schema for contact ID parameter (:id)
 */
export const contactIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'معرف جهة الاتصال يجب أن يكون رقماً صحيحاً موجباً' }),
});

export default {
  createContactSchema,
  updateContactSchema,
  queryContactsSchema,
  contactIdParamSchema,
};
