import express from "express";

import { protect, authorize } from "../middleware/auth.middleware.ts";
import upload from "../middleware/uploadMiddleware.ts";

import { ALL_IMAGE_FIELDS } from "../constants/ingredientsConstants.ts";

import {
    getIngredients,
    createIngredient,
    getIngredient,
    updateIngredient,
    deleteIngredient,
} from "./ingredientsController.js";

// Include other resource routers
const router = express.Router({ mergeParams: true });

// Upload images
const fields = ALL_IMAGE_FIELDS.map(({ fieldName }) => ({
    name: fieldName,
    maxCount: 1,
}));
const uploadImages = upload.fields(fields);

router
    .route("/")
    .get(getIngredients)
    .post(protect, authorize("admin"), uploadImages, createIngredient);
router
    .route("/:ingredientId")
    .get(getIngredient)
    .put(protect, authorize("admin"), uploadImages, updateIngredient)
    .delete(protect, authorize("admin"), deleteIngredient);

export default router;
