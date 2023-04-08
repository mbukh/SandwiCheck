import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generatePasswordToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: Number(process.env.JWT_EXPIRES_IN),
    });
};

export const generateResetPasswordToken = () => {
    return crypto.randomBytes(20).toString("hex");
};

export const hashToken = (token) => {
    crypto.createHash("sha256").update(token).digest("hex");
};
