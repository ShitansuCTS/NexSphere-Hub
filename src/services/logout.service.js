import { prisma } from "@/lib/prisma";

export const logoutService = async (token) => {

    if (!token) {
        return;
    }

    await prisma.session.deleteMany({
        where: {
            token,
        },
    });

    return true;
};