import { NextResponse } from "next/server";

import {
    getNacByIdController,
    updateNacController,
    deleteNacController,
} from "@/controllers/nac/nac.controller";

export async function GET(request, { params }) {
    try {
        const response = await getNacByIdController(params.id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET NAC ERROR:", error);

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

        const response = await updateNacController(
            params.id,
            body
        );

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("UPDATE NAC ERROR:", error);

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
        const response = await deleteNacController(params.id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("DELETE NAC ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}