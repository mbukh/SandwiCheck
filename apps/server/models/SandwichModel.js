import mongoose from 'mongoose';
import { DIETARY_PREFERENCE, isBreadType, PORTION, PRODUCT } from '../constants/ingredientsConstants.js';
import { MAX_COMMENT_LENGTH, MAX_INGREDIENTS_COUNT, MAX_NAME_LENGTH } from '../constants/sandwichConstants.js';
import Ingredient from './IngredientModel.js';

const { Schema } = mongoose;

const ingredientWithPortionSchema = new Schema(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    portion: {
      type: String,
      enum: Object.values(PORTION),
      default: PORTION.full,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const sandwichSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Sandwich name is required'],
      trim: true,
      minlength: [3, 'Name field must be at least 3 characters long'],
      maxlength: [MAX_NAME_LENGTH, `Name field must be at most ${MAX_NAME_LENGTH} characters long`],
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    image: {
      type: String,
      default: 'defaultSandwichImage.png',
      required: [true, 'Sandwich image is required'],
    },
    votesCount: {
      type: Number,
      default: 0,
      min: [0, 'A number of votes can be a positive number only'],
    },
    ingredients: {
      type: [ingredientWithPortionSchema],
      required: true,
      validate: [
        ingredientsValidator,
        'Use bread as the primary ingredient only, and include at least one additional ingredient besides the bread',
      ],
    },
    dietaryPreferences: [
      {
        type: String,
        enum: {
          values: Object.values(DIETARY_PREFERENCE),
          message: `Dietary preferences must be either ${Object.values(DIETARY_PREFERENCE).join(', ')}`,
        },
      },
    ],
    comment: {
      type: String,
      trim: true,
      maxlength: [MAX_COMMENT_LENGTH, `Keep your comment within ${MAX_COMMENT_LENGTH} characters`],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_, returnValue) {
        returnValue.id = returnValue._id;
        delete returnValue._id;
        delete returnValue.__v;
        delete returnValue.__t;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_, returnValue) {
        delete returnValue.__v;
        delete returnValue.__t;
      },
    },
  },
);

sandwichSchema.pre('save', async function (next) {
  const ingredientIds = this.ingredients.map((item) => item.ingredientId);
  const ingredients = await Ingredient.find({
    _id: { $in: ingredientIds },
  });

  this.dietaryPreferences = setDietaryPreferences(ingredients);

  next();
});

async function ingredientsValidator(ingredientsWithPortions) {
  if (ingredientsWithPortions.length < 2) {
    throw new Error('At least two ingredients are required');
  }

  if (ingredientsWithPortions.length > MAX_INGREDIENTS_COUNT) {
    throw new Error(`No more than ${MAX_INGREDIENTS_COUNT} ingredients are allowed`);
  }

  const firstIngredient = await Ingredient.findById(ingredientsWithPortions[0].ingredientId);

  if (!firstIngredient || !isBreadType(firstIngredient.type)) {
    throw new Error('The first ingredient must be bread');
  }

  const isNotFullPortionData = ingredientsWithPortions.some(
    (ingredient) => !firstIngredient._id.equals(ingredient.ingredientId) && !ingredient.portion,
  );
  if (isNotFullPortionData) {
    throw new Error('Some of the ingredients lack portion data');
  }

  const otherIngredientIds = ingredientsWithPortions.slice(1).map((item) => item.ingredientId);
  const otherIngredients = await Ingredient.find({ _id: { $in: otherIngredientIds } })
    .select('type')
    .lean();

  if (otherIngredients.length != otherIngredientIds.length) {
    throw new Error("One of the ingredients doesn't exist");
  }

  const isOneBread = !otherIngredients.some((item) => isBreadType(item.type));

  if (!isOneBread) {
    throw new Error('Only one bread is allowed as the primary ingredient');
  }

  return true;
}

/**
 * Expands dietary preferences to include implied relationships.
 * Currently: vegan implies vegetarian.
 * @param {string[]} preferences - Array of dietary preference strings
 * @returns {string[]} Expanded preferences array
 */
function expandDietaryPreferences(preferences) {
  const expanded = [...preferences];
  // Vegan always implies vegetarian
  if (preferences.includes(DIETARY_PREFERENCE.vegan)) {
    expanded.push(DIETARY_PREFERENCE.vegetarian);
  }
  return [...new Set(expanded)]; // Remove duplicates
}

/**
 * Calculates the dietary preferences for a sandwich based on its ingredients.
 * The result is the intersection of all ingredient preferences, with special handling:
 * - Vegan ingredients are treated as vegetarian (vegan implies vegetarian)
 * - Kosher is removed if both meat and dairy are present
 * @param {Array} ingredients - Array of ingredient objects with dietaryPreferences property
 * @returns {string[]} Array of dietary preference strings
 */
function setDietaryPreferences(ingredients) {
  if (ingredients.length === 0) {
    return [];
  }

  // Expand preferences for each ingredient (vegan → vegetarian)
  const expandedPreferences = ingredients.map((ingredient) =>
    expandDietaryPreferences(ingredient.dietaryPreferences || []),
  );

  // Calculate intersection of all expanded preferences
  let intersection = [...expandedPreferences[0]];

  for (const preferences of expandedPreferences.slice(1)) {
    intersection = intersection.filter((preference) => preferences.includes(preference));
  }

  // Kosher rule: remove kosher if both meat and dairy are present
  const hasDairy = ingredients.some((ingredient) => ingredient.dietaryPreferences?.includes(PRODUCT.dairy));
  const hasMeat = ingredients.some((ingredient) => ingredient.dietaryPreferences?.includes(PRODUCT.meat));
  if (hasDairy && hasMeat) {
    intersection = intersection.filter((preference) => preference !== DIETARY_PREFERENCE.kosher);
  }

  return intersection;
}

const Sandwich = mongoose.model('Sandwich', sandwichSchema);

export default Sandwich;
