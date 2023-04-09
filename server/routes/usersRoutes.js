import express from "express";

import { protect, authorize } from "../middleware/authMiddleware.js";
import uploadImage from "../middleware/uploadMiddleware.js";
import resizeImage from "../middleware/resizeMiddleware.js";

import {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from "../controllers/usersController.js";

// Include other resource routers
const router = express.Router({ mergeParams: true });

router.route("/current").get(protect, getUser);
router.route("/").post(protect, authorize("admin"), getUsers);
router
    .route("/:id")
    .get(protect, authorize("parent"), getUser)
    .put(
        protect,
        authorize("user", "child", "parent"),
        uploadImage,
        resizeImage,
        updateUser
    )
    .delete(protect, authorize("user", "child", "parent"), deleteUser);

export default router;
