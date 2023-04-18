import createHttpError from "http-errors";
import expressAsyncHandler from "express-async-handler";

import { createUserParentsConnections } from "../utils/manageUserConnections.js";
import { setTokenCookie, removeCookie } from "../utils/cookies.js";
import * as hashAndTokens from "../utils/hashAndTokens.js";

import User from "../models/UserModel.js";

// @desc    Create a chid account
// @route   POST /auth/create-child
// @access  Private/Parent
export const createChildUser = expressAsyncHandler(async (req, res, next) => {
    const parentUser = req.user;
    const { name } = req.body;

    if (!name) {
        return next(createHttpError.BadRequest("Name id required"));
    }

    const childUser = await User.create({
        isTetheredChild: true,
        name,
        parents: [parentUser._id],
    });

    await createUserParentsConnections(childUser, parentUser._id);

    const token = {
        name: "childToken",
        value: hashAndTokens.generatePasswordToken({ id: childUser._id }),
    };

    setTokenCookie(token, res);

    res.status(200).json({
        success: true,
        data: childUser,
    });
});

// @desc    Create a chid account
// @route   POST /auth/switch-to-parent
// @access  Private/Child
export const switchToParent = expressAsyncHandler(async (req, res, next) => {
    if (!req.parentUser) {
        return next(
            createHttpError.BadRequest("A logged-in parent required to switch back")
        );
    }

    removeCookie("childToken", res);

    const token = {
        name: "token",
        value: hashAndTokens.generatePasswordToken({ id: req.parentUser._id }),
    };

    setTokenCookie(token, res);

    res.status(200).json({
        success: true,
        data: req.parentUser,
    });
});

// @desc    Login
// @route   POST /api/auth/login-child
// @access  Private/Parent
export const loginChildUser = expressAsyncHandler(async (req, res, next) => {
    const parentUser = req.user;
    const { childId } = req.body;

    if (!childId) {
        createHttpError.BadRequest("Child ID is required");
    }

    if (!parentUser.children.includes(childId)) {
        return next(createHttpError.Forbidden("Not authorized to access this child"));
    }

    const childUser = await User.findById(childId);

    if (!childUser) {
        return next(createHttpError.NotFound("Child account not found"));
    }

    const token = {
        name: "childToken",
        value: hashAndTokens.generatePasswordToken({ id: childUser._id }),
    };

    setTokenCookie(token, res);

    res.status(200).json({
        success: true,
        data: childUser,
    });
});
