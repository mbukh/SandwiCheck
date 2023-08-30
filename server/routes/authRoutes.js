import express from "express";

import { ROLES } from "../constants/usersConstants.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

import {
    createChildUser,
    switchToParent,
    loginChildUser,
} from "../controllers/authChildController.js";
import {
    signup,
    login,
    changePassword,
    forgotPassword,
    resetPassword,
    logout,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/create-child", protect, authorize(ROLES.parent), createChildUser);
router.post("/login-child", protect, authorize(ROLES.parent), loginChildUser);
router.post("/switch-to-parent", protect, authorize(ROLES.child), switchToParent);

router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

router.post("/logout", protect, logout);

export default router;
