import type { ParamsDictionary } from 'express-serve-static-core';
import {
  type ApiResponse,
  type CreateSandwichDto,
  MAX_COMMENT_LINES,
  PORTION,
  type Portion,
  type UpdateSandwichDto,
} from '@sandwicheck/shared';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { SANDWICHES_DIR } from '#config/dir.ts';
import {
  DEFAULT_SANDWICH_UPDATE_WINDOW_MINUTES,
  DEFAULT_SANDWICHES_PER_PAGE,
  MAX_SANDWICHES_PER_PAGE,
  NO_USER_SANDWICH_USERNAME,
} from '#constants/sandwichConstants.ts';
import type { IIngredientWithPortion, SandwichDocument } from '#models/SandwichModel.ts';
import Sandwich from '#models/SandwichModel.ts';
import User from '#models/UserModel.ts';
import asyncHandler from '#utils/asyncHandler.ts';
import { removeFile } from '#utils/fileUtils.ts';
import { generateSandwichImage } from '#utils/manageSandwichesImages.ts';

/*
 * @desc    Fetch all sandwiches
 * @route   GET /api/sandwiches
 * @access  Public
 */
export const getSandwiches = asyncHandler(async (req, res, _next) => {
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
  // Clamp to a hard ceiling so neither a hostile ?limit= nor a misconfigured env can unbound the page.
  const pageLimit = Math.min(parsePositiveInteger(limit, defaultLimit), MAX_SANDWICHES_PER_PAGE);
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
export const getSandwich = asyncHandler(async (req, res, next) => {
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
export const createSandwich = asyncHandler<ParamsDictionary, ApiResponse<SandwichDocument>, CreateSandwichDto>(
  async (req, res, _next) => {
    const { name, ingredients, comment } = req.body;
    const { id: userId, firstName } = req.user!;

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

    const user = await User.findById(req.user!._id);
    if (user) {
      (user.sandwiches as mongoose.Types.Array<mongoose.Types.ObjectId>).addToSet(newSandwich._id);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Sandwich created',
      data: newSandwich,
    });
  },
);

/*
 * @desc    Update an sandwich
 * @route   PUT /api/sandwiches/:sandwichId
 * @access  Private
 */
export const updateSandwich = asyncHandler<ParamsDictionary, ApiResponse<SandwichDocument>, UpdateSandwichDto>(
  async (req, res, next) => {
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
      process.env.SANDWICH_UPDATE_EXPIRES_IN_MINS,
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
  },
);

/*
 * @desc    Delete an sandwich
 * @route   DELETE /api/sandwiches/:sandwichId
 * @access  Private
 */
export const deleteSandwich = asyncHandler(async (req, res, next) => {
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
 * @desc    Vote for a sandwich (also adds it to the voter's favorites)
 * @route   POST /api/sandwiches/:sandwichId/vote
 * @access  Private
 */
export const voteForSandwich = asyncHandler(async (req, res, next) => {
  const sandwichId = Array.isArray(req.params.sandwichId) ? req.params.sandwichId[0] : req.params.sandwichId;

  if (!sandwichId || !mongoose.Types.ObjectId.isValid(sandwichId)) {
    return next(createHttpError.BadRequest('Invalid sandwich id'));
  }

  if (!(await Sandwich.exists({ _id: sandwichId }))) {
    return next(createHttpError.NotFound('Sandwich not found'));
  }

  /*
   * Voting requires authentication and is coupled to favorites: a vote adds the
   * sandwich to the caller's favoriteSandwiches and bumps the denormalized
   * votesCount. The favoriteSandwiches set is the idempotency gate — the `$ne`
   * filter means $addToSet only matches (and modifies) when the sandwich is not
   * already favorited, so votesCount is incremented exactly once per user and
   * re-voting is a harmless no-op. Two single-doc updates (no transaction) because
   * the local MongoDB is standalone; the only failure mode is a missed +1, never
   * an over-count.
   */
  const favoriteUpdate = await User.updateOne(
    { _id: req.user!._id, favoriteSandwiches: { $ne: sandwichId } },
    { $addToSet: { favoriteSandwiches: sandwichId } },
  );
  const counted = favoriteUpdate.modifiedCount === 1;

  const sandwich = counted
    ? await Sandwich.findOneAndUpdate({ _id: sandwichId }, { $inc: { votesCount: 1 } }, { new: true })
    : await Sandwich.findById(sandwichId);

  res.status(200).json({
    success: true,
    data: sandwich,
  });
});

function normalizeListParam(value: unknown): string[] {
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

function parsePositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(value as string, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeSort(sortBy: unknown): string {
  const sortKey = typeof sortBy === 'string' ? sortBy.trim() : '';

  if (sortKey === 'votesCount' || sortKey === 'votes') {
    return '-votesCount';
  }

  return '-createdAt';
}

const ALLOWED_PORTIONS = new Set(Object.values(PORTION));

function normalizeIngredients(ingredients: unknown): IIngredientWithPortion[] {
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

    /*
     * `ingredientId` and `portion` are validated above (valid ObjectId string and
     * a known PORTION value, or undefined), so converting to the domain types here
     * is safe and keeps the model boundary honest instead of leaking string ids.
     */
    return {
      ingredientId: new mongoose.Types.ObjectId(ingredientId),
      portion: portion as Portion | undefined,
    };
  });
}

function sanitizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return;
  }

  // Validate newline count
  const newlineCount = (trimmed.match(/\n/g) || []).length;
  if (newlineCount > MAX_COMMENT_LINES - 1) {
    throw createHttpError.BadRequest(
      `Comment cannot contain more than ${MAX_COMMENT_LINES - 1} newlines (${MAX_COMMENT_LINES} lines total)`,
    );
  }

  return trimmed;
}
