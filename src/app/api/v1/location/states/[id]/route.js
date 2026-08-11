import { NextResponse } from "next/server";

import {
    getStateByIdController,
    updateStateController,
    deleteStateController,
} from "@/controllers/state/state.controller";

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const response = await getStateByIdController(id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET STATE ERROR:", error);

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

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;

        const body = await request.json();

        const response = await updateStateController(
            id,
            body
        );

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("UPDATE STATE ERROR:", error);

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

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        console.log("DELETE STATE ID:", id);

        const response = await deleteStateController(id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("DELETE STATE ERROR:", error);

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