import { NextResponse } from "next/server";
import { loginController } from "@/controllers/auth.controller";

export async function POST(request) {
    try {
        const body = await request.json();

        const response = await loginController(body);

        return NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );

    } catch (error) {
        console.error(error);

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