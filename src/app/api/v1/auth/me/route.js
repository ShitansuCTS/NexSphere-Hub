import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { meController } from "@/controllers/me.controller";

export async function GET() {

    try {

        const cookieStore = await cookies();

        const token =
            cookieStore.get("token")?.value;

        const response =
            await meController(token);

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