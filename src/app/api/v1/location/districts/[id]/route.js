import { NextResponse } from "next/server";

import {
    getDistrictByIdController,
    updateDistrictController,
    deleteDistrictController,
} from "@/controllers/district/district.controller";

export async function GET(request, { params }) {
    try {
        const { id } = await params;


        const response =
            await getDistrictByIdController(id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET DISTRICT ERROR:", error);

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
        const { id } = await params;

        const body = await request.json();

        // console.log("UPDATE DISTRICT ID:", id);
        // console.log("UPDATE DISTRICT BODY:", body);

        const response = await updateDistrictController(
            id,
            body
        );

        console.log("UPDATE DISTRICT RESPONSE:", response);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("UPDATE DISTRICT ERROR:", error);

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
        const { id } = await params;

        console.log("###############THE REQUESTED ID :", id)
        const response =
            await deleteDistrictController(id);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("DELETE DISTRICT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}