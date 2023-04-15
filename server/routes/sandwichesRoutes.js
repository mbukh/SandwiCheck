import express from "express";

import { ROLES } from "../constants/usersConstants.js";

import {
    getSandwiches,
    createSandwich,
    getSandwich,
    updateSandwich,
    deleteSandwich,
} from "../controllers/sandwichesController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

// Include other resource routers
const router = express.Router({ mergeParams: true });

router.route("/").get(getSandwiches).post(protect, createSandwich);
router
    .route("/:sandwichId")
    .get(getSandwich)
    .put(protect, authorize(ROLES.user), updateSandwich)
    .delete(protect, authorize(ROLES.user), deleteSandwich);

export default router;
