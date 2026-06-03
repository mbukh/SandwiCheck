import { isBreadType, TYPE } from '@sandwicheck/shared';
import createHttpError from 'http-errors';
import Ingredient from '#models/IngredientModel.ts';
import Sandwich from '#models/SandwichModel.ts';
import asyncHandler from '#utils/asyncHandler.ts';
import { getTimeBasedFilename } from '#utils/fileUtils.ts';
import { removeAllIngredientImagesByImageBase, saveIngredientImages } from '#utils/manageIngredientsImages.ts';

/*
 * @desc    Fetch all ingredients
 * @route   GET /api/ingredients
 * @access  Public
 */
export const getIngredients = asyncHandler(async (req, res, _next) => {
  const parameters = { ...req.query, ...req.body };
  /*
   * Coerce inputs to strings before using them. Without this, a value like
   * ?type[$ne]= arrives as an object and would be injected as a Mongo operator,
   * and dietaryPreferences.split() would throw on non-string input.
   */
  const dietaryPreferences =
    typeof parameters.dietaryPreferences === 'string' ? parameters.dietaryPreferences : undefined;
  const type = typeof parameters.type === 'string' ? parameters.type : undefined;
  const sortBy = typeof parameters.sortBy === 'string' ? parameters.sortBy : undefined;
  const query: Record<string, unknown> = {};

  if (dietaryPreferences) {
    query.dietaryPreferences = { $all: dietaryPreferences.split('|') };
  }

  const sort: Record<string, 1 | -1> = {};

  if (!sortBy) {
    sort.displayPriority = -1;
  } else if (sortBy === 'name') {
    sort.name = -1;
  }

  if (type) {
    query.type = type;
  }

  const ingredients = await Ingredient.find(query).sort(sort);

  res.status(200).json({ success: true, data: ingredients });
});

/*
 * @desc    Fetch a single ingredient
 * @route   GET /api/ingredients/:ingredientId
 * @access  Public
 */
export const getIngredient = asyncHandler(async (req, res, next) => {
  const ingredient = await Ingredient.findById(req.params.ingredientId);

  if (!ingredient) {
    return next(createHttpError.NotFound('Ingredient not found'));
  }

  res.status(200).json({ success: true, data: ingredient });
});

/*
 * @desc    Create an ingredient
 * @route   POST /api/ingredients
 * @access  Private/Admin
 */
export const createIngredient = asyncHandler(async (req, res, next) => {
  const { name, type, dietaryPreferences, shape, displayPriority } = req.body;
  const reqFiles = req.files as Record<string, Express.Multer.File[]>;

  if (!name || !type || (isBreadType(type) && !shape) || !displayPriority) {
    return next(createHttpError.BadRequest('All fields are required'));
  }

  const filenameBase = getTimeBasedFilename();

  const savedFileNames = await saveIngredientImages({
    reqFiles,
    type,
    areAllFieldsRequired: true,
    filenameBase,
    next,
  });

  if (!savedFileNames || savedFileNames.length === 0) {
    return;
  }

  try {
    const ingredient = await Ingredient.create({
      name,
      type,
      shape,
      dietaryPreferences,
      displayPriority: Number.parseInt(displayPriority, 10),
      imageBase: filenameBase,
    });

    res.status(201).json({ success: true, data: ingredient });
  } catch (error) {
    await removeAllIngredientImagesByImageBase(filenameBase);

    return next(error);
  }
});

/*
 * @desc    Update an ingredient
 * @route   PUT /api/ingredients/:ingredientId
 * @access  Private/Admin
 */
export const updateIngredient = asyncHandler(async (req, res, next) => {
  const { name, type, dietaryPreferences, shape, displayPriority } = req.body;
  const reqFiles = req.files as Record<string, Express.Multer.File[]>;

  const ingredient = await Ingredient.findById(req.params.ingredientId);

  if (!ingredient) {
    return next(createHttpError.NotFound('Ingredient not found'));
  }

  if (!name || !type || (isBreadType(type) && !shape) || !displayPriority) {
    return next(createHttpError.BadRequest('Name and type are required fields'));
  }

  if (ingredient.type !== type && (isBreadType(ingredient.type) || isBreadType(type))) {
    return next(
      createHttpError.BadRequest(
        `Types can only be swapped between ${Object.values(TYPE)
          .filter((type) => !isBreadType(type))
          .join(', ')}`,
      ),
    );
  }

  if (Object.keys(reqFiles).length > 0) {
    const filenameBase = ingredient.imageBase;

    const savedFileNames = await saveIngredientImages({
      reqFiles,
      type,
      areAllFieldsRequired: false,
      filenameBase,
      next,
    });

    if (!savedFileNames || savedFileNames.length === 0) {
      return;
    }
  }

  ingredient.name = name;
  ingredient.type = type;
  ingredient.shape = shape;
  ingredient.dietaryPreferences = dietaryPreferences;
  ingredient.displayPriority = Number.parseInt(displayPriority, 10);

  const updatedIngredient = await ingredient.save();

  res.status(200).json({ success: true, data: updatedIngredient });
});

/*
 * @desc    Delete an ingredient
 * @route   DELETE /api/ingredients/:ingredientId
 * @access  Private/Admin
 */
export const deleteIngredient = asyncHandler(async (req, res, next) => {
  const ingredientId = req.params.ingredientId;

  const sandwichWithIngredient = await Sandwich.findOne({
    'ingredients.ingredientId': ingredientId,
  });

  if (sandwichWithIngredient) {
    return next(createHttpError.BadRequest('Cannot delete ingredient, it is currently used in a sandwich'));
  }

  const ingredient = await Ingredient.findByIdAndDelete(ingredientId);

  if (!ingredient) {
    return next(createHttpError.NotFound('Ingredient not found'));
  }

  // await removeAllIngredientImagesByImageBase(ingredient.imageBase);

  res.status(200).json({
    success: true,
    message: 'Ingredient successfully deleted',
    data: ingredient,
  });
});
