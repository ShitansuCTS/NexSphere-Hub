import { meService } from "@/services/me.service";

export const meController = async (token) => {

    try {

        const user = await meService(token);

        return {
            status: 200,
            data: {
                success: true,
                user,
            },
        };

    } catch (error) {

        const errorMap = {
            UNAUTHORIZED: 401,
            INVALID_TOKEN: 401,
            SESSION_NOT_FOUND: 401,
            USER_NOT_FOUND: 404,
            ACCOUNT_DISABLED: 403,
        };

        return {
            status: errorMap[error.message] || 500,
            data: {
                success: false,
                message: error.message,
            },
        };
    }
};