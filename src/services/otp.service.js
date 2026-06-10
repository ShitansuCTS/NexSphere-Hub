import { prisma } from "@/lib/prisma";
import { generateJwt } from "@/lib/auth";

export const verifyOtpService = async ({ email, otp }) => {
    // Find User
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    // Get Latest OTP
    const otpRecord = await prisma.otp.findFirst({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!otpRecord) {
        throw new Error("OTP_NOT_FOUND");
    }

    // Check Expiry
    if (otpRecord.expiresAt < new Date()) {
        throw new Error("OTP_EXPIRED");
    }

    // Check Attempts
    if (otpRecord.attempts >= 5) {
        throw new Error("OTP_LIMIT_EXCEEDED");
    }

    // Verify OTP
    if (otpRecord.code !== otp) {

        await prisma.otp.update({
            where: {
                id: otpRecord.id,
            },
            data: {
                attempts: {
                    increment: 1,
                },
            },
        });

        throw new Error("INVALID_OTP");
    }

    // Generate JWT
    const token = generateJwt({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    // Create Session
    await prisma.session.create({
        data: {
            userId: user.id,
            token,
            expiresAt: new Date(
                Date.now() + 60 * 60 * 1000
            ),
        },
    });

    // Delete OTP after success
    await prisma.otp.delete({
        where: {
            id: otpRecord.id,
        },
    });

    return {
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};