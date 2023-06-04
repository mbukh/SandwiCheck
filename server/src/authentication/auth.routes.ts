import express from "express";

import { ROLES } from "../constants/usersConstants.ts";

import { protect, authorize } from "../middleware/auth.middleware.ts";

import * as auth from "./auth.controller.ts";
import * as authChild from "./authChild.controller.ts";

const router = express.Router();

router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.post("/logout", protect, auth.logout);

router.put("/change-password", protect, auth.changePassword);
router.post("/forgot-password", auth.forgotPassword);
router.put("/reset-password/:resetToken", auth.resetPassword);

router.post("/create-child", protect, authorize(ROLES.parent), authChild.createChildUser);
router.post("/login-child", protect, authorize(ROLES.parent), authChild.loginChildUser);
router.post("/switch-to-parent", protect, authorize(ROLES.child), authChild.switchToParent);

export default router;
