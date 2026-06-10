import { validateLoginInput } from "@/validations/auth.validation";
import { loginService } from "@/services/auth.service";

export const loginController = async (body) => {
    const validation = validateLoginInput(body);

    if (!validation.success) {
        return {
            status: 400,
            data: validation,
        };
    }

    try {
        const result = await loginService(body);

        return {
            status: 200,
            data: result,
        };
    } catch (error) {

        if (error.message === "INVALID_CREDENTIALS") {
            return {
                status: 401,
                data: {
                    success: false,
                    message: "Invalid email or password",
                },
            };
        }

        if (error.message === "ACCOUNT_DISABLED") {
            return {
                status: 403,
                data: {
                    success: false,
                    message: "Account disabled",
                },
            };
        }

        return {
            status: 500,
            data: {
                success: false,
                message: "Internal server error",
            },
        };
    }
};