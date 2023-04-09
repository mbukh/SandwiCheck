import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";

import jwt from "jsonwebtoken";

import excludeFields from "../constants/excludeFields.js";

import User from "../models/userSchema.js";

export const protect = expressAsyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else {
        return next(createError(401, "Not authorized, no token"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select(excludeFields);

        if (!req.user) {
            throw new Error();
        }

        next();
    } catch (error) {
        next(createError(401, "Not authorized, token failed"));
    }
});

export const authorize = (...roles) => {
    return async (req, res, next) => {
        const user = req.user;
        const { id } = req.params;

        // Check if user is an admin
        if (user.roles.includes("admin")) {
            return next();
        }

        // Check if user has a valid role
        if (roles.length && !roles.some((role) => user.roles.includes(role))) {
            return next(createError(403, "Not authorized to access this resource"));
        }

        // Check if user is accessing their own profile or a child's profile
        if (user._id.toString() === id || (user.children && user.children.includes(id))) {
            return next();
        }

        // All other access is disallowed
        return next(createError(403, "Not authorized to access this resource"));
    };
};
