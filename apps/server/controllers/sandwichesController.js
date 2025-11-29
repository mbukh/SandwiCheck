import expressAsyncHandler from 'express-async-handler';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { SANDWICHES_DIR } from '../config/dir.js';
import { PORTION } from '../constants/ingredientsConstants.js';
import {
  DEFAULT_SANDWICH_UPDATE_WINDOW_MINUTES,
  DEFAULT_SANDWICHES_PER_PAGE,
  NO_USER_SANDWICH_USERNAME,
} from '../constants/sandwichConstants.js';
import Sandwich from '../models/SandwichModel.js';
import User from '../models/UserModel.js';
import { removeFile } from '../utils/fileUtils.js';
import { generateSandwichImage } from '../utils/manageSandwichesImages.js';

/*
 * @desc    Fetch all sandwiches
 * @route   GET /api/sandwiches
 * @access  Public
 */
export const getSandwiches = expressAsyncHandler(async (req, res, _next) => {
  const { dietaryPreferences, ingredients, sortBy, page, limit } = {
    ...req.query,
    ...req.body,
  };

  const dietaryFilters = normalizeListParam(dietaryPreferences);
  const ingredientFilters = normalizeListParam(ingredients);

  const query = Sandwich.find();

  if (dietaryFilters.length > 0) {
    query.where('dietaryPreferences').all(dietaryFilters);
  }

  if (ingredientFilters.length > 0) {
    query.where('ingredients.ingredientId').all(ingredientFilters);
  }

  query.sort(normalizeSort(sortBy));

  const defaultLimit = parsePositiveInteger(process.env.SANDWICHES_PER_PAGE_DEFAULT, DEFAULT_SANDWICHES_PER_PAGE);
  const pageLimit = parsePositiveInteger(limit, defaultLimit);
  const pageNumber = parsePositiveInteger(page, 1);

  query.skip((pageNumber - 1) * pageLimit).limit(pageLimit);

  const sandwiches = await query.exec();

  res.status(200).json({
    success: true,
    message: 'Sandwiches retrieved',
    count: sandwiches.length,
    data: sandwiches,
  });
});

/*
 * @desc    Fetch a single sandwich
 * @route   GET /api/sandwiches/:sandwichId
 * @access  Public
 */
export const getSandwich = expressAsyncHandler(async (req, res, next) => {
  const sandwich = await Sandwich.findById(req.params.sandwichId);

  if (!sandwich) {
    return next(createHttpError.NotFound('Sandwich not found'));
  }

  res.status(200).json({
    success: true,
    data: sandwich,
  });
});

/*
 * @desc    Create an sandwich
 * @route   POST /api/sandwiches
 * @access  Private
 */
export const createSandwich = expressAsyncHandler(async (req, res, _next) => {
  const { name, ingredients, comment } = req.body;
  const { id: userId, firstName } = req.user;

  const saveIngredients = normalizeIngredients(ingredients);

  if (saveIngredients.length < 2) {
    throw createHttpError.BadRequest('Please add at least two ingredients before saving your sandwich');
  }

  const newSandwich = new Sandwich({
    name: typeof name === 'string' ? name.trim() : name,
    ingredients: saveIngredients,
    authorName: firstName,
    authorId: userId,
    comment: sanitizeOptionalString(comment),
  });

  await newSandwich.validate();

  newSandwich.image = await generateSandwichImage(saveIngredients);

  await newSandwich.save();

  const user = await User.findById(req.user._id);
  if (user) {
    user.sandwiches.addToSet(newSandwich._id);
    await user.save();
  }

  res.status(201).json({
    success: true,
    message: 'Sandwich created',
    data: newSandwich,
  });
});

/*
 * @desc    Update an sandwich
 * @route   PUT /api/sandwiches/:sandwichId
 * @access  Private
 */
export const updateSandwich = expressAsyncHandler(async (req, res, next) => {
  const { name, ingredients, comment } = req.body;

  const sandwich = await Sandwich.findById(req.params.sandwichId);

  if (!sandwich) {
    return next(createHttpError.NotFound('Sandwich not found'));
  }

  const newIngredients = normalizeIngredients(ingredients);

  if (newIngredients.length < 2) {
    throw createHttpError.BadRequest('Please add at least two ingredients before updating your sandwich');
  }

  const updateWindowMinutes = parsePositiveInteger(
    process.env.SANDWICH_UPDATE_EXPIRES_IN_MIN,
    DEFAULT_SANDWICH_UPDATE_WINDOW_MINUTES,
  );
  const minutesSinceCreation = (Date.now() - sandwich.createdAt.getTime()) / 60_000;

  if (minutesSinceCreation > updateWindowMinutes) {
    return next(
      createHttpError.Forbidden(
        `A sandwich can only be updated within the first ${updateWindowMinutes} minutes. Please create a new sandwich instead.`,
      ),
    );
  }

  if (typeof name === 'string') {
    sandwich.name = name.trim();
  }
  sandwich.ingredients = newIngredients;
  sandwich.comment = sanitizeOptionalString(comment);

  await sandwich.validate();

  const newImage = await generateSandwichImage(newIngredients);
  const oldImage = sandwich.image;

  sandwich.image = newImage;
  await sandwich.save();

  if (newImage !== oldImage) {
    const stillUsingImage = await Sandwich.exists({ image: oldImage, _id: { $ne: sandwich._id } });
    if (!stillUsingImage) {
      await removeFile(SANDWICHES_DIR, oldImage);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Sandwich updated',
    data: sandwich,
  });
});

/*
 * @desc    Delete an sandwich
 * @route   DELETE /api/sandwiches/:sandwichId
 * @access  Private
 */
export const deleteSandwich = expressAsyncHandler(async (req, res, next) => {
  const sandwich = await Sandwich.findById(req.params.sandwichId);

  if (!sandwich) {
    return next(createHttpError.NotFound('Sandwich not found'));
  }

  await Sandwich.updateOne({ _id: sandwich._id }, { authorName: NO_USER_SANDWICH_USERNAME }, { runValidators: true });

  const user = sandwich.authorId ? await User.findById(sandwich.authorId) : null;
  if (user) {
    user.sandwiches = user.sandwiches.filter((sandwichId) => !sandwichId.equals(sandwich._id));
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Sandwich removed from the user',
  });
});

/*
 * @desc    Update vote count of a sandwich
 * @route   POST|DELETE /api/sandwiches/:sandwichId/vote
 * @access  Private
 */
export const updateSandwichVotesCount = expressAsyncHandler(async (req, res, next) => {
  const { sandwichId } = req.params;
  const method = req.method;

  const sandwich = await Sandwich.findById(sandwichId);

  if (!sandwich) {
    return next(createHttpError.NotFound('Sandwich not found'));
  }

  if (method === 'POST') {
    sandwich.votesCount = (sandwich.votesCount ?? 0) + 1;
  } else if (method === 'DELETE') {
    sandwich.votesCount = Math.max(0, (sandwich.votesCount ?? 0) - 1);
  } else {
    throw createHttpError.MethodNotAllowed('Unsupported vote action');
  }

  await sandwich.save();

  res.status(200).json({
    success: true,
    data: sandwich,
  });
});

function normalizeListParam(value) {
  if (!value) {
    return [];
  }

  const rawValues = Array.isArray(value) ? value : [value];

  const flattened = rawValues
    .flatMap((item) => String(item).split(/[,|]/))
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set(flattened)];
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeSort(sortBy) {
  const sortKey = typeof sortBy === 'string' ? sortBy.trim() : '';

  if (sortKey === 'votesCount' || sortKey === 'votes') {
    return '-votesCount';
  }

  return '-createdAt';
}

const ALLOWED_PORTIONS = new Set(Object.values(PORTION));

function normalizeIngredients(ingredients) {
  if (!Array.isArray(ingredients)) {
    throw createHttpError.BadRequest('Ingredients must be provided as an array');
  }

  return ingredients.map((ingredient, index) => {
    const rawId = ingredient?.ingredientId ?? ingredient?.id ?? ingredient?._id;
    const ingredientId =
      typeof rawId === 'string'
        ? rawId.trim()
        : rawId && typeof rawId.toString === 'function'
          ? rawId.toString().trim()
          : '';

    if (!ingredientId) {
      throw createHttpError.BadRequest(`Ingredient at position ${index + 1} is missing an id`);
    }

    if (!mongoose.Types.ObjectId.isValid(ingredientId)) {
      throw createHttpError.BadRequest(`Ingredient id "${ingredientId}" is invalid`);
    }

    let portion = ingredient?.portion;
    if (portion !== undefined && portion !== null) {
      portion = String(portion).trim().toLowerCase();

      if (portion.length === 0) {
        portion = undefined;
      } else if (!ALLOWED_PORTIONS.has(portion)) {
        throw createHttpError.BadRequest(`Invalid portion value "${portion}" for ingredient at position ${index + 1}`);
      }
    } else {
      portion = undefined;
    }

    return {
      ingredientId,
      portion,
    };
  });
}

function sanitizeOptionalString(value) {
  if (typeof value !== 'string') {
    return;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
