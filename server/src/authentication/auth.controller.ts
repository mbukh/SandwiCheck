import createHttpError from "http-errors";
import expressAsyncHandler from "express-async-handler";

import bcrypt from "bcryptjs";

import { ROLES } from "../constants/usersConstants.ts";
import { generateHtmlMessage, generateTextMessage } from "../constants/mailing.ts";

import { createUserParentsConnections } from "../utils/manageUserConnections.ts";
import { getCreateCookieOptions, getRemoveCookieOptions } from "./auth.service.ts";
import * as hashAndTokens from "../utils/hashAndTokens.ts";
import sendEmail from "../utils/mailer.ts";
import delay from "../utils/delay.ts";

import User from "../user/user.model.ts";
import { EmailOptions } from "../types/mailing.types.ts";
import RequestWithUser from "../types/requestWithUser.types.ts";
import { NextFunction, Response } from "express";

// @desc    Signup
// @route   POST /api/auth/signup
// @access  Public
export const signup = expressAsyncHandler(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        const { name, email, password, role, parentId } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return next(createHttpError.BadRequest("User already exists"));
        }

        if (!name || !email || !password || !role) {
            return next(createHttpError.BadRequest("All fields are required"));
        }

        if (role !== ROLES.child && role !== ROLES.parent) {
            return next(
                createHttpError.BadRequest(
                    "Choose a valid user role: either child or parent"
                )
            );
        }

        if (password.length < 5 || password.length > 20) {
            return next(
                createHttpError.BadRequest(
                    "A password must contain between 5 and 20 characters, including letters and numbers"
                )
            );
        }

        const passwordHash = await bcrypt.hash(
            password,
            parseInt(process.env.BCRYPT_SALT_ROUND as string, 10)
        );

        const user = await User.create({
            name,
            email,
            roles: [ROLES.user, role],
            password: passwordHash,
        });

        if (!user) {
            return next(createHttpError.BadRequest("Invalid user data"));
        }

        if (parentId) {
            const res = await createUserParentsConnections(user, parentId);
            if (!res) {
                return next(new createHttpError.BadRequest("Parent not found"));
            }
        }

        const cookie = {
            name: "token",
            value: hashAndTokens.generatePasswordToken({ id: user._id.toString() }),
            options: getCreateCookieOptions(),
        };
        res.cookie(cookie.name, cookie.value, cookie.options);

        res.status(200).json({
            success: true,
            data: user,
        });
    }
);

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
export const login = expressAsyncHandler(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        const { email, password, parentId } = req.body;

        if (!email || !password) {
            return next(
                new createHttpError.BadRequest("Please provide an email and password")
            );
        }

        const user = await User.findOne({ email })
            .populate("sandwiches")
            .populate("parents")
            .populate("children");

        if (!user || !(await bcrypt.compare(password, user.password as string))) {
            return next(createHttpError.Unauthorized("Invalid email or password"));
        }

        if (parentId) {
            const res = await createUserParentsConnections(user, parentId);
            if (!res) {
                return next(new createHttpError.BadRequest("Parent not found"));
            }
        }

        const cookie = {
            name: "token",
            value: hashAndTokens.generatePasswordToken({ id: user._id.toString() }),
            options: getCreateCookieOptions(),
        };
        res.cookie(cookie.name, cookie.value, cookie.options);

        res.status(200).json({
            success: true,
            data: user,
        });
    }
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = expressAsyncHandler(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return next(createHttpError.NotFound("User not found"));
        }

        if (!oldPassword || !newPassword) {
            return next(
                createHttpError.BadRequest(
                    "Both old and new passwords are required to change password"
                )
            );
        }

        if (newPassword.length < 5 || newPassword.length > 20) {
            return next(
                createHttpError.BadRequest(
                    "A password must contain between 5 and 20 characters, including letters and numbers"
                )
            );
        }

        const doesPasswordMatch = await bcrypt.compare(
            oldPassword,
            user.password as string
        );

        if (!doesPasswordMatch) {
            return next(createHttpError.Unauthorized("Old password is incorrect"));
        }

        user.password = await bcrypt.hash(
            newPassword,
            parseInt(process.env.BCRYPT_SALT_ROUND as string, 10)
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully, you may log in now",
        });
    }
);

// @desc    Request forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = expressAsyncHandler(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        const { email } = req.body;

        if (!email) {
            return next(createHttpError.BadRequest("Email is required"));
        }

        const user = await User.findOne({ email });
        if (!user) {
            // SECURITY REASON NOT TO REPORT ABOUT NON EXISTING USER AND FAKE SENDING EMAIL
            await delay(2000 + Math.random() * 2000);

            res.status(200).json({
                success: true,
                message: "Reset password email sent",
            });

            return next();
        }

        const resetToken = hashAndTokens.generateResetToken();

        user.resetPasswordToken = hashAndTokens.hashToken(resetToken);
        user.resetPasswordExpire = new Date(
            Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRES_IN || "1200000", 10)
        );

        await user.save();

        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Password Reset",
            html: generateHtmlMessage({ userName: user.name, resetURL }),
            text: generateTextMessage({ userName: user.name, resetURL }),
        } as EmailOptions);

        res.status(200).json({
            success: true,
            message: "Reset password email sent",
        });
    }
);

// @desc    Request reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = expressAsyncHandler(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        const { newPassword } = req.body;

        const resetPasswordToken = hashAndTokens.hashToken(req.params.resetToken);

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return next(createHttpError.Unauthorized("Invalid token"));
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully. You may log in now",
        });
    }
);

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = expressAsyncHandler(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        res.clearCookie("token", getRemoveCookieOptions());
        res.clearCookie("childToken", getRemoveCookieOptions());

        res.status(200).json({
            success: true,
            message: "User logged out",
        });
    }
);
