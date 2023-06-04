import { CookieOptions } from "express";

export const getCreateCookieOptions = (): CookieOptions => {
    return {
        expires: new Date(
            Date.now() +
                parseInt(process.env.JWT_COOKIE_EXPIRE_IN_DAYS || "90", 10) *
                    24 *
                    60 *
                    60 *
                    1000
        ),
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production" ? true : false,
    };
};

export const getRemoveCookieOptions = (): CookieOptions => {
    return {
        expires: new Date(Date.now() - 1),
        httpOnly: true,
    };
};
