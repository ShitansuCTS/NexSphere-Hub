// src/utils/fileUpload.js
import fs from "fs/promises";
import path from "path";

export const uploadFile = async (file, subfolder = "") => {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);

    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate a unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    const relativeFilePath = path.join("/uploads", subfolder, filename).replace(/\\/g, "/"); // Path accessible from the web

    await fs.writeFile(filePath, buffer);

    return {
      success: true,
      message: "File uploaded successfully",
      filePath: relativeFilePath,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      message: "Failed to upload file: " + error.message,
    };
  }
};