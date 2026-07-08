import { NextResponse } from "next/server";

import { previewContactImportController } from "@/controllers/contacts/contact-import.controller";

export async function POST(request) {
    try {
        const formData = await request.formData();

        console.log("CONTACT IMPORT PREVIEW REQUEST:", formData);

        const response =
            await previewContactImportController(formData);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("CONTACT IMPORT PREVIEW ERROR:", error);

        if (error.name === "ZodError" || error.issues) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        error.issues?.[0]?.message ||
                        "Validation error",
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Internal server error",
            },
            { status: 500 }
        );
    }
}