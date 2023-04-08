import express from "express";

import {
    getIngredients,
    createIngredient,
    getIngredient,
    updateIngredient,
    deleteIngredient,
} from "../controllers/IngredientsController.js";

// Include other resource routers
const router = express.Router({ mergeParams: true });

router.route("/").get(getIngredients).post(protect, createIngredient);
router.route("/:id").get(getIngredient).put(updateIngredient).delete(deleteIngredient);

export default router;
