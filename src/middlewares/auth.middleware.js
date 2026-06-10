import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

export const validateAuth = async (token) => {

    if (!token) {
        return false;
    }

    const decoded = verifyJwt(token);

    if (!decoded) {
        return false;
    }

    const session = await prisma.session.findFirst({
        where: {
            token,
        },
    });

    if (!session) {
        return false;
    }

    return decoded;
};