import { importContacts } from "@/controllers/contacts/contact.import.controller";

export async function POST(request) {
  return importContacts(request);
}