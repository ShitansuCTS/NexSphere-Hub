// src/controllers/contacts/profilePicture.controller.js
import { updateContactProfilePictureService } from "@/services/contacts/contact.service";
import { uploadFile } from "@/utils/fileUpload"; // Assuming a file upload utility

export const updateProfilePicture = async (req, context) => {
  try {
    const params = await context.params;
    const { id } = params;

    const formData = await req.formData();
    const profilePicture = formData.get("profilePicture");

    if (!profilePicture) {
      return Response.json(
        { success: false, message: "No profile picture provided" },
        { status: 400 }
      );
    }

    // You would typically validate the file type and size here
    // For example:
    // if (!profilePicture.type.startsWith("image/")) {
    //   return Response.json(
    //     { success: false, message: "Invalid file type. Only images are allowed." },
    //     { status: 400 }
    //   );
    // }
    // if (profilePicture.size > 5 * 1024 * 1024) { // 5MB limit
    //   return Response.json(
    //     { success: false, message: "File size exceeds the limit of 5MB." },
    //     { status: 400 }
    //   );
    // }

    const uploadResult = await uploadFile(profilePicture, "profile-pictures"); // 'profile-pictures' is the subfolder

    if (!uploadResult.success) {
      return Response.json(uploadResult, { status: 500 });
    }

    const imageUrl = uploadResult.filePath; // Path to the uploaded image

    const result = await updateContactProfilePictureService(id, imageUrl);

    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update profile picture: " + error.message,
      },
      { status: 500 }
    );
  }
};
