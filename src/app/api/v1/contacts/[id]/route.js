import {
  getContact,
  updateContact,
  deleteContact,
} from "@/controllers/contacts/contact.controller";

/**
 * GET /api/v1/contacts/:id
 */
export async function GET(request, context) {
  return getContact(request, context);
}

/**
 * PUT /api/v1/contacts/:id
 */
export async function PUT(request, context) {
  return updateContact(request, context);
}

/**
 * DELETE /api/v1/contacts/:id
 */
export async function DELETE(request, context) {
  return deleteContact(request, context);
}