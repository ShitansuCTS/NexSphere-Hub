import { NextResponse } from "next/server";

import {
    createNacController,
    getNacsController,
} from "@/controllers/nac/nac.controller";

export async function POST(request) {
    try {
        const body = await request.json();

        const response = await createNacController(body);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("CREATE NAC ERROR:", error);

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
            districtId: searchParams.get("districtId"),
        };

        const response = await getNacsController(query);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET NACS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}