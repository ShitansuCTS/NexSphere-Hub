import { NextResponse } from "next/server";

import {
    deleteContactController,
    getContactByIdController,
    updateContactController,
} from "@/controllers/contacts/contact.controller";

export async function GET(
    request,
    { params }
) {
    try {
        const response =
            await getContactByIdController(
                params.id
            );

        return NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );
    } catch (error) {
        console.error(
            "GET CONTACT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(
    request,
    { params }
) {
    try {
        const body = await request.json();

        const response =
            await updateContactController(
                params.id,
                body
            );

        return NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );
    } catch (error) {
        console.error(
            "UPDATE CONTACT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(
    request,
    { params }
) {
    try {
        const response =
            await deleteContactController(
                params.id
            );

        return NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );
    } catch (error) {
        console.error(
            "DELETE CONTACT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}