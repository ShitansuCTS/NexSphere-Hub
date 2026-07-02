import { NextResponse } from "next/server";

import {
    createBoothController,
    getBoothsController,
} from "@/controllers/booth/booth.controller";

export async function POST(request) {
    try {
        const body = await request.json();

        const response = await createBoothController(body);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("CREATE BOOTH ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const query = {
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
            search: searchParams.get("search"),
            wardId: searchParams.get("wardId"),
        };

        const response = await getBoothsController(query);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET BOOTHS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}