import expressAsyncHandler from "express-async-handler";

import createHttpError from "http-errors";

import { NO_USER_SANDWICH_USERNAME } from "../constants/sandwichConstants.js";

import Sandwich from "../models/SandwichModel.js";
import User from "../models/UserModel.js";

// @desc    Fetch all sandwiches
// @route   GET /api/sandwiches
// @access  Public
export const getSandwiches = expressAsyncHandler(async (req, res, next) => {
    const { dietaryPreferences, ingredients, sortBy, page, limit } = {
        ...req.query,
        ...req.body,
    };

    const query = Sandwich.find();

    if (dietaryPreferences) {
        query.where("dietaryPreferences").all(dietaryPreferences.split("|"));
    }

    if (ingredients) {
        const ingredientIds = ingredients.split("|");
        query.where("ingredients.ingredientId").all(ingredientIds);
    }

    if (sortBy) {
        query.sort(sortBy === "createdAt" ? "-createdAt" : "-votesCount");
    }

    // Set default values for page and limit if not provided
    const pageNumber = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || process.env.SANDWICHES_PER_PAGE;

    // Calculate the number of documents to skip based on the current page and limit
    const skipCount = (pageNumber - 1) * pageLimit;

    query.skip(skipCount).limit(pageLimit);

    const sandwiches = await query.exec();

    res.status(200).json({
        success: true,
        message: "Sandwiches retrieved",
        count: sandwiches.length,
        data: sandwiches,
    });
});

// @desc    Fetch a single sandwich
// @route   GET /api/sandwiches/:sandwichId
// @access  Public
export const getSandwich = expressAsyncHandler(async (req, res, next) => {
    const sandwich = await Sandwich.findById(req.params.sandwichId).populate(
        "ingredients"
    );

    if (!sandwich) {
        return next(createHttpError.NotFound("Sandwich not found"));
    }

    res.status(200).json({
        success: true,
        data: sandwich,
    });
});

// @desc    Create an sandwich
// @route   POST /api/sandwiches
// @access  Private
export const createSandwich = expressAsyncHandler(async (req, res, next) => {
    const { name, ingredients, comment } = req.body;
    const { id: userId, firstName } = req.user;

    const newSandwich = await Sandwich.create({
        name,
        ingredients,
        authorName: firstName,
        authorId: userId,
        comment: comment,
    });

    const user = await User.findById(req.user._id);
    user.sandwiches.push(newSandwich._id);
    await user.save();

    res.status(201).json({
        success: true,
        message: "Sandwich created",
        data: newSandwich,
    });
});

// @desc    Update an sandwich
// @route   PUT /api/sandwiches/:sandwichId
// @access  Private
export const updateSandwich = expressAsyncHandler(async (req, res, next) => {
    const { name, ingredients, comment } = req.body;

    const sandwich = await Sandwich.findById(req.params.sandwichId);

    if (!sandwich) {
        return next(createHttpError.NotFound("Sandwich not found"));
    }

    const timeDiff = (Date.now() - sandwich.createdAt) / 1000 / 60;

    if (timeDiff > parseInt(process.env.SANDWICH_UPDATE_EXPIRES_IN_MINS)) {
        return next(
            createHttpError.Forbidden(
                "Too much time passed, you can't update the sandwich. Copy"
            )
        );
    }

    sandwich.name = name;
    sandwich.ingredients = ingredients;
    sandwich.comment = comment;

    await sandwich.save();

    res.status(200).json({
        success: true,
        message: "Sandwich updated",
        data: sandwich,
    });
});

// @desc    Delete an sandwich
// @route   DELETE /api/sandwiches/:sandwichId
// @access  Private
export const deleteSandwich = expressAsyncHandler(async (req, res, next) => {
    const sandwich = await Sandwich.findById(req.params.sandwichId);

    if (!sandwich) {
        return next(createHttpError.NotFound("Sandwich not found"));
    }

    await Sandwich.updateOne(
        { _id: sandwich._id },
        { authorName: NO_USER_SANDWICH_USERNAME },
        { runValidators: true }
    );

    const user = await User.findById(sandwich.authorId);
    user.sandwiches = user.sandwiches.filter(
        (sandwichId) => !sandwichId.equals(sandwich._id)
    );
    await user.save();

    res.status(200).json({
        success: true,
        message: "Sandwich removed from the user",
    });
});
