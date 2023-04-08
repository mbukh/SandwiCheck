import express from "express";

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
router.route("/:id").get(getSandwich).put(protect, updateSandwich).delete(protect, deleteSandwich);

export default router;
