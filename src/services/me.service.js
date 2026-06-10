import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

export const meService = async (token) => {

    if (!token) {
        throw new Error("UNAUTHORIZED");
    }

    const decoded = verifyJwt(token);

    if (!decoded) {
        throw new Error("INVALID_TOKEN");
    }

    const session = await prisma.session.findFirst({
        where: {
            token,
        },
    });

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    if (!user.isActive) {
        throw new Error("ACCOUNT_DISABLED");
    }

    return user;
};