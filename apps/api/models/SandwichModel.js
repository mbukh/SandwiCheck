import mongoose from 'mongoose';

import { DIETARY_PREFERENCES, PORTIONS, PRODUCTS, isBreadType } from '../constants/ingredientsConstants.js';

import { MAX_INGREDIENTS_COUNT, MAX_NAME_LENGTH, MAX_COMMENT_LENGTH } from '../constants/sandwichConstants.js';

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
      enum: [...Object.values(PORTIONS)],
      default: PORTIONS.full,
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
          values: Object.values(DIETARY_PREFERENCES),
          message: `Dietary preferences must be either ${Object.values(DIETARY_PREFERENCES).join(', ')}`,
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
      transform: function (_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.__t;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_, ret) {
        delete ret.__v;
        delete ret.__t;
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

function setDietaryPreferences(ingredients) {
  if (ingredients.length === 0) {
    return [];
  }

  // Create an array to store the intersection of all dietary preferences
  let intersection = ingredients[0].dietaryPreferences.slice();

  ingredients.slice(1).forEach((ingredient) => {
    intersection = intersection.filter((preference) => ingredient.dietaryPreferences.includes(preference));
  });

  // Kosher not mixing meat and diary
  const hasDiary = ingredients.some((ingredient) => ingredient.dietaryPreferences.includes(PRODUCTS.diary));
  const hasMeat = ingredients.some((ingredient) => ingredient.dietaryPreferences.includes(PRODUCTS.meat));
  if (hasDiary && hasMeat) {
    intersection = intersection.filter((preference) => preference !== DIETARY_PREFERENCES.kosher);
  }

  return intersection;
}

const Sandwich = mongoose.model('Sandwich', sandwichSchema);

export default Sandwich;
