import { verifyOtpService } from "@/services/otp.service";
import { validateOtpInput } from "@/validations/otp.validation";

export const verifyOtpController = async (body) => {

    const validation = validateOtpInput(body);

    if (!validation.success) {
        return {
            status: 400,
            data: validation,
        };
    }

    try {

        const result = await verifyOtpService(body);

        return {
            status: 200,
            data: result,
        };

    } catch (error) {

        const errorMap = {
            USER_NOT_FOUND: 404,
            OTP_NOT_FOUND: 404,
            OTP_EXPIRED: 400,
            OTP_LIMIT_EXCEEDED: 429,
            INVALID_OTP: 401,
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