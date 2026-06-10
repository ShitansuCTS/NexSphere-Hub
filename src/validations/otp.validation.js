export const validateOtpInput = (data) => {
    const { email, otp } = data;

    if (!email || !otp) {
        return {
            success: false,
            message: "Email and OTP are required",
        };
    }

    if (otp.length !== 6) {
        return {
            success: false,
            message: "Invalid OTP",
        };
    }

    return {
        success: true,
    };
};