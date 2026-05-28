import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { INGREDIENTS_DIR, SANDWICHES_DIR } from '../config/dir.js';
import { isBreadType } from '../constants/ingredientsConstants.js';
import Ingredient from '../models/IngredientModel.js';

export const generateSandwichImage = async (ingredientsWithPortions) => {
  const ingredients = await fillIngredientsData(ingredientsWithPortions);

  if (!ingredients || ingredients.length === 0) {
    throw new Error('No ingredients provided for sandwich image generation');
  }

  if (!ingredients[0] || !ingredients[0].shape) {
    throw new Error('First ingredient (bread) must have a shape property');
  }

  const shape = ingredients[0].shape;

  const fileName =
    ingredients.map((item) => `${item.imageBase}${item.shape || `${shape}_${item.portion}`}`).join('_') +
    `.${process.env.INGREDIENTS_IMAGE_EXTENSION}`;

  const outputPath = path.join(SANDWICHES_DIR, fileName);

  if (await fileExists(outputPath)) {
    return fileName;
  }

  // Process the ingredients
  const [bread, ...otherIngredients] = ingredients;

  const breadImageFile = path.join(
    INGREDIENTS_DIR,
    `${bread.imageBase}_sliced.${process.env.INGREDIENTS_IMAGE_EXTENSION}`,
  );

  const breadImage = sharp(breadImageFile);

  const otherIngredientsImages = await Promise.all(
    otherIngredients.map(async (ingredient) => await generateSandwichLayer(shape, ingredient)),
  );

  // Composite and save the image
  await breadImage
    .composite(
      otherIngredientsImages.map((ingredientImage) => ({
        input: ingredientImage,
      })),
    )
    .toFile(outputPath);

  return fileName;
};

// UTILS

async function fillIngredientsData(ingredientsWithPortions) {
  // Get the ingredientIds from the input array
  const ingredientIds = ingredientsWithPortions.map((item) => item.ingredientId);

  // Find the ingredients with the given ingredientIds and select the required fields
  const ingredients = await Ingredient.find({ _id: { $in: ingredientIds } })
    .select('_id imageBase type shape')
    .lean();

  // Create a map of ingredientId to ingredient for easier lookup
  const ingredientsMap = new Map(ingredients.map((item) => [item._id.toString(), item]));

  // Map the original array to the fetched documents, preserving the original order and adding the portion field
  const result = ingredientsWithPortions.map((item) => {
    // Convert ingredientId to string for map lookup (map uses string keys)
    const ingredient = ingredientsMap.get(item.ingredientId.toString());
    if (!ingredient) {
      throw new Error(`Ingredient with ID ${item.ingredientId} not found in database`);
    }
    if (!ingredient.shape) {
      ingredient.portion = item.portion;
    }
    return ingredient;
  });

  return result;
}

async function generateSandwichLayer(shape, ingredient) {
  const { imageBase, type, portion } = ingredient;
  const suffix = isBreadType(type) ? '_sliced' : `_${shape}_${portion}`;

  const imageFile = path.join(INGREDIENTS_DIR, `${imageBase}${suffix}.${process.env.INGREDIENTS_IMAGE_EXTENSION}`);

  return await sharp(imageFile).toBuffer();
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    } else {
      throw error;
    }
  }
}
