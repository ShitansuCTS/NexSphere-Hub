import {
  createContact,
  getContacts,
} from "@/controllers/contacts/contact.controller";

/**
 * GET /api/v1/contacts
 */
export async function GET(request) {
  return getContacts(request);
}

/**
 * POST /api/v1/contacts
 */
export async function POST(request) {
  console.log("Request is coming to the route", request.body);
  return createContact(request);
}