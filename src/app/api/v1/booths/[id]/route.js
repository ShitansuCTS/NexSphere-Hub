import { NextResponse } from "next/server";

import {
    getBoothByIdController,
    updateBoothController,
    deleteBoothController,
} from "@/controllers/booth/booth.controller";

export async function GET(request, { params }) {
    try {
        const response = await getBoothByIdController(params.id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET BOOTH ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const body = await request.json();

        const response = await updateBoothController(params.id, body);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("UPDATE BOOTH ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const response = await deleteBoothController(params.id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("DELETE BOOTH ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}