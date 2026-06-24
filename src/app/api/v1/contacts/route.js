import { NextResponse } from "next/server";

import {
    createContactController,
    getContactsController,
} from "@/controllers/contacts/contact.controller";

export async function POST(request) {
    try {
        const body = await request.json();

        const response =
            await createContactController(body);

        return NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );
    } catch (error) {
        console.error(
            "CREATE CONTACT ERROR:",
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

export async function GET(request) {
    try {
        const { searchParams } = new URL(
            request.url
        );

        const query = {
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
            search: searchParams.get("search"),

            nacId:
                searchParams.get("nacId"),
            blockId:
                searchParams.get("blockId"),
            gpId:
                searchParams.get("gpId"),
            villageId:
                searchParams.get("villageId"),
            wardId:
                searchParams.get("wardId"),
            boothId:
                searchParams.get("boothId"),
        };

        const response =
            await getContactsController(
                query
            );

        return NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );
    } catch (error) {
        console.error(
            "GET CONTACTS ERROR:",
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