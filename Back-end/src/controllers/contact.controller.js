import { asyncHandler } from '../utils/asyncHandler.js';
import * as contactService from '../services/contact.service.js';

/**
 * Task 1: Create a single contact
 * Route: POST /api/contacts
 */
export const createContact = asyncHandler(async (req, res) => {
  const { phone, name, city_id, source_id, activity_type_id } = req.body;

  const newContact = await contactService.createContact({
    phone,
    name,
    city_id,
    source_id,
    activity_type_id,
  });

  return res.status(201).json({
    status: 'success',
    message: 'تم إضافة جهة الاتصال بنجاح',
    data: newContact,
  });
});

/**
 * Task 2, 4, 5: Get contacts list with pagination, search, and filtering
 * Route: GET /api/contacts
 */
export const getContacts = asyncHandler(async (req, res) => {
  const { page, limit, search, city_id, source_id, activity_type_id, sortBy, sortOrder } = req.query;

  const result = await contactService.getContacts({
    page,
    limit,
    search,
    city_id,
    source_id,
    activity_type_id,
    sortBy,
    sortOrder,
  });

  return res.status(200).json({
    status: 'success',
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * Task 2: Get single contact by ID
 * Route: GET /api/contacts/:id
 */
export const getContactById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await contactService.getContactById(id);

  return res.status(200).json({
    status: 'success',
    data: contact,
  });
});

/**
 * Task 3: Update an existing contact
 * Route: PUT /api/contacts/:id
 */
export const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedContact = await contactService.updateContact(id, updates);

  return res.status(200).json({
    status: 'success',
    message: 'تم تحديث جهة الاتصال بنجاح',
    data: updatedContact,
  });
});

/**
 * Task 3: Delete a contact
 * Route: DELETE /api/contacts/:id
 */
export const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await contactService.deleteContact(id);

  return res.status(200).json({
    status: 'success',
    message: 'تم حذف جهة الاتصال بنجاح',
  });
});

export default {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
};
