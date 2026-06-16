import { NextResponse } from "next/server";

import {
    getBlockByIdController,
    updateBlockController,
    deleteBlockController,
} from "@/controllers/block/block.controller";

export async function GET(request, { params }) {
    try {
        const response =
            await getBlockByIdController(params.id);

        return NextResponse.json(response.data, {
            status: response.status,
        });

    } catch (error) {
        console.error("GET BLOCK ERROR:", error);

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

        const response =
            await updateBlockController(
                params.id,
                body
            );

        return NextResponse.json(response.data, {
            status: response.status,
        });

    } catch (error) {
        console.error("UPDATE BLOCK ERROR:", error);

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
        const response =
            await deleteBlockController(params.id);

        return NextResponse.json(response.data, {
            status: response.status,
        });

    } catch (error) {
        console.error("DELETE BLOCK ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}