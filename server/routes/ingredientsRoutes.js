import express from "express";

import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import { allImageFields } from "../constants/ingredientsConstants.js";

import {
    getIngredients,
    createIngredient,
    getIngredient,
    updateIngredient,
    deleteIngredient,
} from "../controllers/IngredientsController.js";

// Include other resource routers
const router = express.Router({ mergeParams: true });

// Upload images
const fields = allImageFields.map(({ fieldName }) => ({
    name: fieldName,
    maxCount: 1,
}));
const uploadImages = upload.fields(fields);

router
    .route("/")
    .get(getIngredients)
    .post(protect, authorize("admin"), uploadImages, createIngredient);
router
    .route("/:id")
    .get(getIngredient)
    .put(protect, authorize("admin"), uploadImages, updateIngredient)
    .delete(protect, authorize("admin"), deleteIngredient);

export default router;
