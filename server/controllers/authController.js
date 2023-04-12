import createError from "http-errors";
import expressAsyncHandler from "express-async-handler";

import bcrypt from "bcryptjs";

import { generateHtmlMessage, generateTextMessage } from "../constants/mailing.js";

import { createUserParentsConnections } from "../utils/manageUserConnections.js";
import sendTokenResponse from "../utils/sendTokenResponse.js";
import * as hashAndTokens from "../utils/hashAndTokens.js";
import sendEmail from "../utils/mailer.js";
import delay from "../utils/delay.js";

import User from "../models/userModel.js";

// @desc    Signup
// @route   POST /api/auth/signup
// @access  Public
export const signup = expressAsyncHandler(async (req, res, next) => {
    const { name, email, password, parentId } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(createError(400, "User already exists"));
    }

    if (!name || !email || !password) {
        return next(createError(400, "All fields are required"));
    }

    if (password.length < 5 || password.length > 20) {
        return next(
            createError(
                400,
                "A password must contain between 5 and 20 characters, including letters and numbers"
            )
        );
    }

    const passwordHash = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALT_ROUNDS)
    );

    const user = await User.create({
        name,
        email,
        password: passwordHash,
    });

    if (!user) {
        return next(createError(400, "Invalid user data"));
    }

    if (parentId) {
        await createUserParentsConnections(user, parentId);
    }

    sendTokenResponse(201, hashAndTokens.generatePasswordToken({ id: user._id }), res);
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
export const login = expressAsyncHandler(async (req, res, next) => {
    const { email, password, parentId } = req.body;

    if (!email || !password) {
        return next(new createError(400, "Please provide an email and password"));
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(createError(401, "Invalid email or password"));
    }

    if (parentId) {
        await createUserParentsConnections(user, parentId);
    }

    sendTokenResponse(200, hashAndTokens.generatePasswordToken({ id: user._id }), res);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = expressAsyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(createError(404, "User not found"));
    }

    if (!oldPassword || !newPassword) {
        return next(
            createError(400, "Both old and new passwords are required to change password")
        );
    }

    if (newPassword.length < 5 || newPassword.length > 20) {
        return next(
            createError(
                400,
                "A password must contain between 5 and 20 characters, including letters and numbers"
            )
        );
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
        return next(createError(401, "Old password is incorrect"));
    }

    user.password = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));

    await user.save();

    res.status(200).json({
        success: true,
        data: { message: "Password updated successfully" },
    });
});

// @desc    Request forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = expressAsyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(createError(400, "Email is required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        // SECURITY REASON NOT TO REPORT ABOUT NON EXISTING USER AND FAKE SENDING EMAIL
        await delay(2000 + Math.random() * 2000);

        res.status(200).json({
            success: true,
            data: { message: "Reset password email sent" },
        });

        return next();
    }

    const resetToken = hashAndTokens.generateResetPasswordToken();

    user.resetPasswordToken = hashAndTokens.hashToken(resetToken);
    user.resetPasswordExpire = Date.now() + Number(process.env.RESET_PASSWORD_EXPIRES_IN);

    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Password Reset",
        html: generateHtmlMessage({ user, resetURL }),
        text: generateTextMessage({ user, resetURL }),
    });

    res.status(200).json({
        success: true,
        data: { message: "Reset password email sent" },
    });
});

// @desc    Request reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = expressAsyncHandler(async (req, res, next) => {
    const { newPassword } = req.body;

    const resetPasswordToken = hashAndTokens.hashToken(req.params.resetToken);

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(createError(401, "Invalid token"));
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        data: { message: "Password updated successfully" },
    });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = expressAsyncHandler(async (req, res, next) => {
    res.clearCookie("token");

    res.status(200).json({
        success: true,
        data: {
            message: "User logged out",
            token: "none",
        },
    });
});
