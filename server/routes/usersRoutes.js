import express from "express";

import { ROLES } from "../constants/usersConstants.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import resizeImage from "../middleware/resizeMiddleware.js";

import {
    addSandwichToWeekMenu,
    removeSandwichFromWeekMenu,
} from "../controllers/userWeekMenuController.js";

import {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    updateFavoriteSandwiches,
} from "../controllers/usersController.js";

// Include other resource routers
const router = express.Router({ mergeParams: true });

// Upload image
export const uploadImage = upload.single("profilePicture");

router.route("/").get(protect, authorize(ROLES.admin), getUsers);

router.route("/current").get(protect, getUser);

router
    .route("/:userId/favorite-sandwiches/:sandwichId")
    .post(protect, authorize(ROLES.user), updateFavoriteSandwiches)
    .delete(protect, authorize(ROLES.user), updateFavoriteSandwiches);

router
    .route("/:userId/week-menu/:day")
    .put(protect, authorize(ROLES.user, ROLES.parent), addSandwichToWeekMenu)
    .delete(protect, authorize(ROLES.user, ROLES.parent), removeSandwichFromWeekMenu);

router
    .route("/:userId")
    .get(protect, authorize(ROLES.user, ROLES.parent), getUser)
    .put(
        protect,
        authorize(ROLES.user, ROLES.parent),
        uploadImage,
        resizeImage,
        updateUser
    )
    .delete(protect, authorize(ROLES.user), deleteUser);

export default router;
