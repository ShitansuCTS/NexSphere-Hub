import { NextResponse } from "next/server";

import {
    getVillageByIdController,
    updateVillageController,
    deleteVillageController,
} from "@/controllers/village/village.controller";

export async function GET(request, { params }) {
    try {
        const response = await getVillageByIdController(params.id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET VILLAGE ERROR:", error);

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

        const response = await updateVillageController(params.id, body);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("UPDATE VILLAGE ERROR:", error);

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
        const response = await deleteVillageController(params.id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("DELETE VILLAGE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}