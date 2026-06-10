export const validateLoginInput = (data) => {
    const { email, password } = data;

    if (!email || !password) {
        return {
            success: false,
            message: "Email and password are required",
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: "Invalid email format",
        };
    }

    return {
        success: true,
    };
};