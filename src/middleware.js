import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request) {

    const token =
        request.cookies.get("token")?.value;

    const pathname =
        request.nextUrl.pathname;

    const publicRoutes = [
        "/sign-in",
        "/verify-otp",
    ];

    const isPublicRoute =
        publicRoutes.includes(pathname);

    // if (!token && !isPublicRoute) {
    //     return NextResponse.redirect(
    //         new URL("/sign-in", request.url)
    //     );
    // }

    if (token && pathname === "/sign-in") {
        return NextResponse.redirect(
            new URL("/", request.url)
        );
    }

    if (token) {

        const decoded =
            await verifyToken(token);

        // console.log(decoded);

        if (!decoded) {
            return NextResponse.redirect(
                new URL("/sign-in", request.url)
            );
        }
    }

    return NextResponse.next();
}



export const config = {
    matcher: [
        /*
          Protect everything except:
          - api
          - _next
          - favicon
          - images
          - assets
        */
        "/((?!api|_next|favicon.ico|assets).*)",
    ],
};