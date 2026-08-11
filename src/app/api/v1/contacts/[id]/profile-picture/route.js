// src/app/api/v1/contacts/[id]/profile-picture/route.js
import { updateProfilePicture } from "@/controllers/contacts/profilePicture.controller";

/**
 * PUT /api/v1/contacts/:id/profile-picture
 */
export async function PUT(request, context) {
  return updateProfilePicture(request, context);
}