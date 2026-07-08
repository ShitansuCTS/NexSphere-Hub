import { NextResponse } from "next/server";

import { confirmContactImportController } from "@/controllers/contacts/contact-import.controller";

export async function POST(request) {
    try {
        const body = await request.json();

        const response =
            await confirmContactImportController(body);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("CONTACT IMPORT CONFIRM ERROR:", error);

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