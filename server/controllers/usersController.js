import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";

import { profilePicturesDir } from "../config/dir.js";

import { saveBufferToFile, removeFile } from "../utils/fileUtils.js";
import { removeUserConnections } from "../utils/manageUserConnections.js";

import User from "../models/userModel.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = expressAsyncHandler(async (req, res, next) => {
    const users = await User.find(req.body);
    res.json({ success: true, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private +Parents
export const getUser = expressAsyncHandler(async (req, res, next) => {
    let userId;

    if (!req.params.id) {
        userId = req.user.id;
    } else {
        userId = req.params.id;
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(createError(404, "User not found"));
    }
    res.json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private +Parents
export const updateUser = expressAsyncHandler(async (req, res, next) => {
    const {
        name,
        dietaryPreferences,
        removeProfilePicture,
        removeParentId,
        removeChildId,
    } = req.body;
    const imageBuffer = req.file && req.file.buffer;

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(createError(404, "User not found"));
    }

    if (name) {
        user.name = name;
    }

    if (dietaryPreferences) {
        user.dietaryPreferences = dietaryPreferences;
    }

    if (removeParentId) {
        const res = await removeUserConnections(user, "parents", removeParentId);
        if (res.error) {
            return next(createError(403, res.error));
        }
    }

    if (removeChildId) {
        const res = await removeUserConnections(user, "children", removeChildId);
        if (res.error) {
            return next(createError(403, res.error));
        }
    }

    if (imageBuffer && !removeProfilePicture) {
        const fileName = `${user._id.toString()}.${process.env.PROFILE_IMAGE_EXTENSION}`;
        const res = await saveBufferToFile(imageBuffer, profilePicturesDir, fileName);
        if (res) {
            user.profilePicture = fileName;
        }
    }

    if (removeProfilePicture) {
        const fileName = user.profilePicture;
        await removeFile(profilePicturesDir, fileName);
        user.profilePicture = undefined;
    }

    const updatedUser = await user.save();

    res.json({ success: true, data: updatedUser });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private +Parent
export const deleteUser = expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(createError(404, "User not found"));
    }

    // Remove user from parents' children arrays
    if (user.parents && user.parents.length) {
        await removeUserConnections(user, "parents");
    }

    // Remove user from children's parents arrays
    if (user.children && user.children.length) {
        await removeUserConnections(user, "children");
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    const fileName = `${req.params.id}.${process.env.PROFILE_IMAGE_EXTENSION}`;
    await removeFile(profilePicturesDir, fileName);

    res.json({ success: true, data: "User deleted successfully" });
});
