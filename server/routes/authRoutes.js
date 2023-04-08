import express from "express";

import { protect } from "../middleware/authMiddleware.js";

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

router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

router.post("/logout", protect, logout);

export default router;
