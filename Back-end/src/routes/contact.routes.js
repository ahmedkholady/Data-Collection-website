import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {
  createContactSchema,
  updateContactSchema,
  queryContactsSchema,
  contactIdParamSchema,
} from '../validations/contact.validation.js';
import * as contactController from '../controllers/contact.controller.js';

const router = Router();

/**
 * Task 2, 4, 5: عرض جهات الاتصال، البحث، الفلترة، والـ Pagination
 * GET /api/contacts
 */
router.get('/', validate({ query: queryContactsSchema }), contactController.getContacts);

/**
 * Task 2: عرض تفاصيل جهة اتصال محددة بواسطة الـ ID
 * GET /api/contacts/:id
 */
router.get('/:id', validate({ params: contactIdParamSchema }), contactController.getContactById);

/**
 * Task 1: إضافة جهة اتصال جديدة
 * POST /api/contacts
 */
router.post('/', validate(createContactSchema), contactController.createContact);

/**
 * Task 3: تعديل جهة اتصال محددة
 * PUT /api/contacts/:id
 */
router.put(
  '/:id',
  validate({ params: contactIdParamSchema, body: updateContactSchema }),
  contactController.updateContact
);

/**
 * Task 3: حذف جهة اتصال محددة
 * DELETE /api/contacts/:id
 */
router.delete('/:id', validate({ params: contactIdParamSchema }), contactController.deleteContact);

export default router;
