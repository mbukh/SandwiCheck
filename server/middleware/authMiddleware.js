import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";

import jwt from "jsonwebtoken";

import excludeFields from "../constants/excludeFields.js";

import User from "../models/userSchema.js";

export const protect = expressAsyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select(excludeFields);

            next();
        } catch (error) {
            next(createError(401, "Not authorized, token failed"));
        }
    } else if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            next(createError(401, "Not authorized, token failed"));
        }
    } else {
        next(createError(401, "Not authorized, no token"));
    }
});

export const authorize = (...roles) => {
    return async (req, res, next) => {
        const user = req.user;
        const { id } = req.params;

        // Check if user is an admin
        if (user.role === "admin") {
            return next();
        }

        // Check if user has a valid role
        if (!roles.includes(user.role)) {
            return next(createError(403, "Not authorized to access this resource"));
        }

        // Check if user is accessing their own profile or a child's profile
        if (user._id.toString() === id || user.children.includes(id)) {
            return next();
        }

        // All other access is disallowed
        return next(createError(403, "Not authorized to access this resource"));
    };
};
