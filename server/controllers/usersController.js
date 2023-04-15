import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";

import { profilePicturesDir } from "../config/dir.js";

import { ROLES } from "../constants/usersConstants.js";
import { NO_USER_SANDWICH_USERNAME } from "../constants/sandwichConstants.js";

import { saveBufferToFile, removeFile } from "../utils/fileUtils.js";
import { removeUserConnections } from "../utils/manageUserConnections.js";

import User from "../models/UserModel.js";
import Sandwich from "../models/SandwichModel.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = expressAsyncHandler(async (req, res, next) => {
    const users = await User.find(req.body);
    res.status(200).json({ success: true, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:userId
// @route   GET /api/current
// @access  Private +Parents
export const getUser = expressAsyncHandler(async (req, res, next) => {
    const userId = req.params.userId ? req.params.userId : req.user.id;

    const user = await User.findById(userId).populate("sandwiches");

    if (!user) {
        return next(createHttpError.NotFound("User not found"));
    }

    res.status(200).json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:userId
// @access  Private +Parents
export const updateUser = expressAsyncHandler(async (req, res, next) => {
    const {
        name,
        email,
        role,
        dietaryPreferences,
        removeProfilePicture,
        unlinkParentId,
        unlinkChildId,
    } = req.body;
    const imageBuffer = req.file && req.file.buffer;

    const user = await User.findById(req.params.userId);

    if (!user) {
        return next(createHttpError.NotFound("User not found"));
    }

    const oldName = user.name;

    if (name) {
        user.name = name;
    }

    if (email) {
        user.email = email;
    }

    if (role) {
        if (role === ROLES.parent && !user.isTetheredChild) {
            user.roles.push(ROLES.parent);
        }
        if (role === ROLES.child) {
            if (user.children && user.children.length) {
                return next(
                    createHttpError.BadRequest(
                        "This account already has children. Remove all children before changing to a child user"
                    )
                );
            } else {
                user.roles.pull(ROLES.parent);
                user.roles.push(ROLES.child);
            }
        }
    }

    if (dietaryPreferences) {
        user.dietaryPreferences = dietaryPreferences;
    }

    if (unlinkParentId) {
        const res = await removeUserConnections(user, "parents", unlinkParentId);
        if (res.error) {
            return next(createHttpError.Forbidden(res.error));
        }
    }

    if (unlinkChildId) {
        const res = await removeUserConnections(user, "children", unlinkChildId);
        if (res.error) {
            return next(createHttpError.Forbidden(res.error));
        }
    }

    if (imageBuffer && !removeProfilePicture) {
        const fileName = `${user._id}.${process.env.PROFILE_IMAGE_EXTENSION}`;
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

    if (oldName !== updatedUser.name) {
        await Sandwich.updateMany(
            { authorId: user.id },
            { authorName: updatedUser.firstName }
        );
    }

    res.status(200).json({ success: true, data: updatedUser });
});

// @desc    Delete user
// @route   DELETE /api/users/:userId
// @access  Private / User
export const deleteUser = expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        return next(createHttpError.NotFound("User not found"));
    }

    // Remove user from parents' children arrays
    if (user.parents && user.parents.length) {
        await removeUserConnections(user, "parents");
    }

    // Remove user from children's parents arrays
    if (user.children && user.children.length) {
        await removeUserConnections(user, "children");
    }

    if (user.sandwiches && user.sandwiches.length) {
        await Sandwich.updateMany(
            { _id: { $in: user.sandwiches } },
            { authorName: NO_USER_SANDWICH_USERNAME }
        );
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.userId);

    const fileName = `${req.params.userId}.${process.env.PROFILE_IMAGE_EXTENSION}`;
    await removeFile(profilePicturesDir, fileName);

    res.status(200).json({ success: true, message: "User deleted successfully" });
});
