import { NextResponse } from "next/server";

import {
    createStateController,
    getStatesController,
} from "@/controllers/state/state.controller";

export async function POST(request) {
    try {
        const body = await request.json();

        const response = await createStateController(body);

        return NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );

    } catch (error) {
        console.error("CREATE STATE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            {
                status: 500,
            }
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
        };

        const response =
            await getStatesController(query);

        return NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );

    } catch (error) {
        console.error("GET STATES ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}