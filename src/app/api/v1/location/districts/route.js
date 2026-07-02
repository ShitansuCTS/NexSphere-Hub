import { NextResponse } from "next/server";

import {
    createDistrictController,
    getDistrictsController,
} from "@/controllers/district/district.controller";

export async function POST(request) {
    try {
        const body = await request.json();

        const response =
            await createDistrictController(body);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("CREATE DISTRICT ERROR:", error);

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
            stateId: searchParams.get("stateId"),
        };

        const response =
            await getDistrictsController(query);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET DISTRICTS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}