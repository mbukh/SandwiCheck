import bcrypt from "bcryptjs";

import createError from "http-errors";
import expressAsyncHandler from "express-async-handler";

import { profilePicturesDir } from "../config/dir.js";

import { generateHtmlMessage, generateTextMessage } from "../constants/mailing.js";

import * as hashAndTokens from "../utils/hashAndTokens.js";
import sendEmail from "../utils/mailer.js";
import delay from "../utils/delay.js";
import saveImageFromBuffer from "../utils/saveImageFromBuffer.js";

import User from "../models/userSchema.js";

const sendTokenResponse = (statusCode, token, res) => {
    // Set cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE_IN_DAYS * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
    }

    // Set cookie and send response
    res.status(statusCode).cookie("token", token, cookieOptions).json({
        success: true,
        data: { token },
    });
};

// @desc    Signup
// @route   POST /api/auth/signup
// @access  Public
export const signup = expressAsyncHandler(async (req, res, next) => {
    const { name, email, password, parentId } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(createError(400, "User already exists"));
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (!user) {
        return next(createError(400, "Invalid user data"));
    }

    if (parentId) {
        await User.findByIdAndUpdate(user._id, {
            $push: { parents: parentId },
        });
        await User.findByIdAndUpdate(parentId, {
            $push: { children: user._id },
        });
    }

    if (req.file && req.file.buffer) {
        const fileName = `${user._id.toString()}.${req.file.extension}`;
        await saveImageFromBuffer(req.file.buffer, profilePicturesDir, fileName);

        await User.findByIdAndUpdate(user._id, { profilePicture: fileName });
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

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(createError(401, "Invalid email or password"));
    }

    if (parentId) {
        await User.findByIdAndUpdate(user._id, {
            $addToSet: { parents: parentId },
        });
    }

    sendTokenResponse(200, hashAndTokens.generatePasswordToken({ id: user._id }), res);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = expressAsyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return next(
            createError(400, "Both old and new passwords are required to change password")
        );
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(createError(404, "User not found"));
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
        return next(createError(401, "Old password is incorrect"));
    }

    user.password = newPassword;
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
        // return res.status(404).json({ message: "No user found with this email" });
        // SECURITY REASON NOT TO REPORT ABOUT USER NOT FOUND AND FAKE SENDING EMAIL
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

    // === Generate email === //
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
    await user.save();

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