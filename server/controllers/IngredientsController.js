import expressAsyncHandler from "express-async-handler";

import createHttpError from "http-errors";

import { isBreadType, types } from "../constants/ingredientsConstants.js";

import { getTimeBasedFilename } from "../utils/fileUtils.js";
import {
    saveIngredientImages,
    removeAllIngredientImagesByImageBase,
} from "../utils/manageIngredientsImages.js";

import Ingredient from "../models/IngredientModel.js";
// import Sandwich from "../models/SandwichModel.js";

// @desc    Fetch all ingredients
// @route   GET /api/ingredients
// @access  Public
export const getIngredients = expressAsyncHandler(async (req, res, next) => {
    const { dietaryPreferences, type, sortBy } = { ...req.query };
    let query = {};

    if (dietaryPreferences) {
        query.dietaryPreferences = { $all: dietaryPreferences.split("|") };
    }

    let sort = {};

    if (!sortBy) {
        sort.displayPriority = 1;
    } else if (sortBy === "name") {
        sort.name = 1;
    }

    if (type) {
        query.type = type;
    }

    const ingredients = await Ingredient.find(query).sort(sort);

    // TODO: paging

    res.json({ success: true, data: ingredients });
});

// @desc    Fetch a single ingredient
// @route   GET /api/ingredients/:id
// @access  Public
export const getIngredient = expressAsyncHandler(async (req, res, next) => {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
        return next(createHttpError.NotFound("Ingredient not found"));
    }

    res.json({ success: true, data: ingredient });
});

// @desc    Create an ingredient
// @route   POST /api/ingredients
// @access  Private/Admin
export const createIngredient = expressAsyncHandler(async (req, res, next) => {
    const { name, type, dietaryPreferences, shape, displayPriority } = req.body;
    const reqFiles = req.files;

    if (!name || !type || (isBreadType(type) && !shape) || !displayPriority) {
        return next(createHttpError.BadRequest("All fields are required"));
    }

    const filenameBase = getTimeBasedFilename();

    const savedFileNames = await saveIngredientImages({
        reqFiles,
        type,
        areAllFieldsRequired: true,
        filenameBase,
        next,
    });

    if (!savedFileNames || !savedFileNames.length) {
        return;
    }

    try {
        const ingredient = await Ingredient.create({
            name,
            type,
            shape,
            dietaryPreferences,
            displayPriority: parseInt(displayPriority),
            imageBase: filenameBase,
        });

        res.status(201).json({ success: true, data: ingredient });
    } catch (err) {
        await removeAllIngredientImagesByImageBase(filenameBase);

        return next(err);
    }
});

// @desc    Update an ingredient
// @route   PUT /api/ingredients/:id
// @access  Private/Admin
export const updateIngredient = expressAsyncHandler(async (req, res, next) => {
    const { name, type, dietaryPreferences, shape, displayPriority } = req.body;
    const reqFiles = req.files;

    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
        return next(createHttpError(404, "Ingredient not found"));
    }

    if (!name || !type || (isBreadType(type) && !shape) || !displayPriority) {
        return next(createHttpError.BadRequest("Name and type are required fields"));
    }

    if (ingredient.type !== type && (isBreadType(ingredient.type) || isBreadType(type))) {
        return next(
            createHttpError.BadRequest(
                `Types can only be swapped between ${Object.values(types)
                    .filter((type) => !isBreadType(type))
                    .join(", ")}`
            )
        );
    }

    if (Object.keys(req.files).length) {
        const filenameBase = ingredient.imageBase;

        const savedFileNames = await saveIngredientImages({
            reqFiles,
            type,
            areAllFieldsRequired: false,
            filenameBase,
            next,
        });

        if (!savedFileNames || !savedFileNames.length) {
            return;
        }
    }

    ingredient.name = name;
    ingredient.type = type;
    ingredient.shape = shape;
    ingredient.dietaryPreferences = dietaryPreferences;
    ingredient.displayPriority = parseInt(displayPriority);

    const updatedIngredient = await ingredient.save();

    res.json({ success: true, data: updatedIngredient });
});

// @desc    Delete an ingredient
// @route   DELETE /api/ingredients/:id
// @access  Private/Admin
export const deleteIngredient = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // FIXME: uncomment and test this code

    // const sandwichWithIngredient = await Sandwich.findOne({ ingredients: id });

    // if (sandwichWithIngredient) {
    //     return next(
    //         createHttpError.BadRequest(
    //             "Cannot delete ingredient, it is currently used in a sandwich"
    //         )
    //     );
    // }

    const ingredient = await Ingredient.findByIdAndDelete(id);

    if (!ingredient) {
        return next(createHttpError.NotFound("Ingredient not found"));
    }

    await removeAllIngredientImagesByImageBase(ingredient.imageBase);

    res.json({
        success: true,
        message: "Ingredient successfully deleted",
    });
});
