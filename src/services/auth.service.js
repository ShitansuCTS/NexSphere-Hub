import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";

export const loginService = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    if (!user.isActive) {
        throw new Error("ACCOUNT_DISABLED");
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatch) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const otp = generateOtp();

    const expiry = new Date(
        Date.now() + 5 * 60 * 1000
    );

    await prisma.otp.create({
        data: {
            userId: user.id,
            code: otp,
            expiresAt: expiry,
        },
    });

    console.log("OTP:", otp);

    return {
        success: true,
        message: "OTP sent successfully",
    };
};