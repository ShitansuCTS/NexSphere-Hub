import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { logoutController } from "@/controllers/logout.controller";

export async function POST() {

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    const response = await logoutController(token);

    const res = NextResponse.json(
        response.data,
        {
            status: response.status,
        }
    );

    res.cookies.set("token", "", {
        maxAge: 0,
        path: "/",
    });

    return res;
}