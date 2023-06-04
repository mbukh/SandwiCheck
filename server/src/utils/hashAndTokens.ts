import jwt from "jsonwebtoken";
import crypto from "crypto";
import { DataStoredInToken } from "../types/token.types";

export const generatePasswordToken = (payload: DataStoredInToken): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

export const generateResetToken = (): string => {
    return crypto.randomBytes(20).toString("hex");
};

export const hashToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
