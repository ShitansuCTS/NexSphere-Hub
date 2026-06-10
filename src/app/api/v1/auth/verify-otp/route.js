import { NextResponse } from "next/server";
import { verifyOtpController } from "@/controllers/otp.controller";

export async function POST(request) {
    try {

        const body = await request.json();
      
        const response = await verifyOtpController(body);

        const res = NextResponse.json(
            response.data,
            {
                status: response.status,
            }
        );

        // Set cookie only on success
        if (
            response.status === 200 &&
            response.data.token
        ) {
            res.cookies.set("token", response.data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60, // 1 hour
            });
        }

        return res;

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