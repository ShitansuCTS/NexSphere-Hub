import { logoutService } from "@/services/logout.service";

export const logoutController = async (token) => {

    try {

        await logoutService(token);

        return {
            status: 200,
            data: {
                success: true,
                message: "Logged out successfully",
            },
        };

    } catch {

        return {
            status: 500,
            data: {
                success: false,
                message: "Logout failed",
            },
        };
    }
};