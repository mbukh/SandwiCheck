import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";

import jwt from "jsonwebtoken";

import { ROLES } from "../constants/usersConstants.js";
import EXCLUDED_FIELDS from "../constants/excludeFields.js";

import User from "../models/UserModel.js";

export const protect = expressAsyncHandler(async (req, res, next) => {
    let token, parentToken;

    // console.log(req.originalUrl);
    // console.log("Cookies: ", req.cookies);
    // console.log("Signed Cookies: ", req.signedCookies);

    // Token Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        if (req.headers.authorization.split(" ")[2]) {
            // when logged in as a child
            token = req.headers.authorization.split(" ")[2];
            parentToken = req.headers.authorization.split(" ")[1];
        } else {
            //regular login
            token = req.headers.authorization.split(" ")[1];
        }
    }

    // Cookies
    if (req.cookies && req.cookies.childToken && req.cookies.token) {
        // when logged in as a child
        token = req.cookies.childToken;
        parentToken = req.cookies.token;
    } else if (req.cookies && req.cookies.token) {
        //regular login
        token = req.cookies.token;
    }

    if (!token) {
        return next(createHttpError.Unauthorized("Not authorized, no token"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select(EXCLUDED_FIELDS);

        if (!req.user) {
            throw new Error();
        }

        if (parentToken && req.user.roles.includes(ROLES.child)) {
            const parentDecoded = jwt.verify(parentToken, process.env.JWT_SECRET);

            req.parentUser = await User.findById(parentDecoded.id).select(
                EXCLUDED_FIELDS
            );

            if (!req.parentUser) {
                throw new Error();
            }
        }

        next();
    } catch (error) {
        next(createHttpError.Unauthorized("Not authorized, token failed"));
    }
});

export const authorize = (...roles) => {
    return async (req, res, next) => {
        const user = req.user;
        const { userId, sandwichId } = req.params;

        // Check if user is an admin
        if (user.roles.includes(ROLES.admin)) {
            return next();
        }

        // Check if user has a valid role
        if (roles.length && !roles.some((role) => user.roles.includes(role))) {
            return next(
                createHttpError.Forbidden("Not authorized to access this resource")
            );
        }

        if (userId) {
            // Check if parent-user is accessing their own or their child's profile
            if (
                roles.includes(ROLES.parent) &&
                user.roles.includes(ROLES.parent) &&
                (user._id.equals(userId) ||
                    (user.children && user.children.includes(userId)))
            ) {
                return next();
            }

            // Check if any user is accessing their own profile
            if (user._id.equals(userId)) {
                return next();
            }
        }

        // Check if user is accessing their own sandwich
        if (sandwichId && user.sandwiches.includes(sandwichId)) {
            return next();
        }

        // Let create-child pass for parents
        if (!userId && !sandwichId) {
            return next();
        }

        // All other access is disallowed
        return next(createHttpError.Forbidden("Not authorized to access this resource"));
    };
};
