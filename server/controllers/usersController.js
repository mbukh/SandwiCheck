import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";

import { profilePicturesDir } from "../config/dir.js";

import excludeFields from "../constants/excludeFields.js";

import saveImageFromBuffer from "../utils/saveImageFromBuffer.js";

import User from "../models/userSchema.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getUsers = expressAsyncHandler(async (req, res, next) => {
    const users = await User.find(req.body).select(excludeFields);
    res.json({ success: true, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private, Parents
export const getUser = expressAsyncHandler(async (req, res, next) => {
    let userId;

    if (!req.params.id) {
        userId = req.user.id;
    } else {
        userId = req.params.id;
    }

    const user = await User.findById(userId).select(
        "-password -resetPasswordToken -resetPasswordExpire"
    );
    if (!user) {
        return next(createError(404, "User not found"));
    }
    res.json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private, Parents
export const updateUser = expressAsyncHandler(async (req, res, next) => {
    const { name } = req.body;

    const updateData = { name };

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(createError(404, "User not found"));
    }

    if (req.file && req.file.buffer) {
        const fileName = `${user._id.toString()}.${req.file.extension}`;
        await saveImageFromBuffer(req.file.buffer, profilePicturesDir, fileName);

        await User.findByIdAndUpdate(user._id, { profilePicture: fileName });
    }

    res.json({ success: true, data: { message: "User updated successfully" } });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = expressAsyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(createError(404, "User not found"));
    }
    res.json({ success: true, data: "User deleted successfully" });
});
