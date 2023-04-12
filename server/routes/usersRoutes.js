import express from "express";

import { roles as userRoles } from "../constants/usersConstants.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import resizeImage from "../middleware/resizeMiddleware.js";

import {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from "../controllers/usersController.js";

// Include other resource routers
const router = express.Router({ mergeParams: true });

// Upload image
export const uploadImage = upload.single("profilePicture");

router.route("/current").get(protect, getUser);
router.route("/").post(protect, authorize(userRoles.admin), getUsers);
router
    .route("/:id")
    .get(protect, authorize(userRoles.user, userRoles.parent), getUser)
    .put(
        protect,
        authorize(userRoles.user, userRoles.parent),
        uploadImage,
        resizeImage,
        updateUser
    )
    .delete(protect, authorize(userRoles.user), deleteUser);

export default router;
