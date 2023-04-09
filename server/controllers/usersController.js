import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";

import { profilePicturesDir } from "../config/dir.js";

import excludeFields from "../constants/excludeFields.js";

import { saveImageFromBuffer, removeImage } from "../utils/imageUtils.js";
import { removeUserConnections } from "../utils/manageUserConnections.js";

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

    const user = await User.findById(userId).select(excludeFields);
    if (!user) {
        return next(createError(404, "User not found"));
    }
    res.json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private, Parents
export const updateUser = expressAsyncHandler(async (req, res, next) => {
    const { name, removeParentId, removeChildId } = req.body;
    const file = req.file;
    let fileName;

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(createError(404, "User not found"));
    }

    if (name) {
        user.name = name;
    }

    if (file && file.buffer) {
        fileName = `${user._id.toString()}.${process.env.PROFILE_IMAGE_EXTENSION}`;

        await saveImageFromBuffer(file.buffer, profilePicturesDir, fileName);

        user.profilePicture = fileName;
    }

    if (removeParentId) {
        await removeUserConnections({
            Model: User,
            user,
            field: "parents",
            connectionId: removeParentId,
        });

        user.parents.pull(removeParentId);
    }

    if (removeChildId) {
        await removeUserConnections({
            Model: User,
            user,
            field: "children",
            connectionId: removeChildId,
        });

        user.children.pull(removeChildId);
    }

    try {
        user.save();
    } catch (error) {
        if (fileName) {
            await removeImage(profilePicturesDir, fileName);
        }
    }

    res.json({ success: true, data: { message: "User updated successfully" } });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(createError(404, "User not found"));
    }

    // Remove user from parents' children arrays
    if (user.parents && user.parents.length) {
        await removeUserConnections({ Model: User, user, field: "parents" });
    }

    // Remove user from children's parents arrays
    if (user.children && user.children.length) {
        await removeUserConnections({ Model: User, user, field: "children" });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    const fileName = `${req.params.id}.${process.env.PROFILE_IMAGE_EXTENSION}`;
    await removeImage(profilePicturesDir, fileName);

    res.json({ success: true, data: "User deleted successfully" });
});
