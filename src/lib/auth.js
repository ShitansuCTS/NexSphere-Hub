import jwt from "jsonwebtoken";

export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateJwt(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
}

export function verifyJwt(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}