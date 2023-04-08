import express from "express";

import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import resizeAndCrop from "../middleware/resizeMiddleware.js";

import {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from "../controllers/usersController.js";

// Include other resource routers
const router = express.Router({ mergeParams: true });

router.route("/current").get(protect, getUser);
router
    .route("/")
    .get(protect, authorize("admin"), getUsers)
    .post(protect, authorize("admin"), getUsers);
router
    .route("/:id")
    .get(protect, authorize("parent"), getUser)
    .put(protect, authorize("user", "parent"), upload, resizeAndCrop, updateUser)
    .delete(protect, authorize("user", "parent"), deleteUser);

export default router;
