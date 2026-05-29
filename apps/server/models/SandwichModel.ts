import mongoose from 'mongoose';
import {
  DIETARY_PREFERENCE,
  type DietaryPreference,
  isBreadType,
  PORTION,
  type Portion,
  PRODUCT,
} from '../constants/ingredientsConstants.ts';
import {
  MAX_COMMENT_LENGTH,
  MAX_COMMENT_LINES,
  MAX_INGREDIENTS_COUNT,
  MAX_NAME_LENGTH,
} from '../constants/sandwichConstants.ts';
import Ingredient from './IngredientModel.ts';

const { Schema } = mongoose;

export interface IIngredientWithPortion {
  ingredientId: mongoose.Types.ObjectId;
  portion?: Portion;
}

export interface ISandwich {
  name: string;
  authorName: string;
  authorId?: mongoose.Types.ObjectId;
  image: string;
  votesCount: number;
  ingredients: IIngredientWithPortion[];
  dietaryPreferences: DietaryPreference[];
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SandwichDocument = mongoose.HydratedDocument<ISandwich>;

const ingredientWithPortionSchema = new Schema<IIngredientWithPortion>(
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

const sandwichSchema = new Schema<ISandwich>(
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
      validate: [
        commentNewlinesValidator,
        `Comment cannot contain more than ${MAX_COMMENT_LINES - 1} newlines (${MAX_COMMENT_LINES} lines total)`,
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, returnValue: Record<string, unknown>) {
        returnValue.id = returnValue._id;
        delete returnValue._id;
        delete returnValue.__v;
        delete returnValue.__t;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, returnValue: Record<string, unknown>) {
        delete returnValue.__v;
        delete returnValue.__t;
      },
    },
  },
);

sandwichSchema.pre('save', async function () {
  const ingredientIds = this.ingredients.map((item) => item.ingredientId);
  const ingredients = await Ingredient.find({
    _id: { $in: ingredientIds },
  });

  this.dietaryPreferences = setDietaryPreferences(ingredients);
});

function commentNewlinesValidator(comment: unknown): boolean {
  if (!comment || typeof comment !== 'string') {
    return true; // Allow empty/undefined comments
  }
  const newlineCount = (comment.match(/\n/g) || []).length;
  return newlineCount <= MAX_COMMENT_LINES - 1;
}

async function ingredientsValidator(ingredientsWithPortions: IIngredientWithPortion[]): Promise<boolean> {
  if (ingredientsWithPortions.length < 2) {
    throw new Error('At least two ingredients are required');
  }

  if (ingredientsWithPortions.length > MAX_INGREDIENTS_COUNT) {
    throw new Error(`No more than ${MAX_INGREDIENTS_COUNT} ingredients are allowed`);
  }

  const firstIngredientInput = ingredientsWithPortions[0];
  const firstIngredient = firstIngredientInput ? await Ingredient.findById(firstIngredientInput.ingredientId) : null;

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

/*
 * Expands dietary preferences to include implied relationships.
 * Currently: vegan implies vegetarian.
 */
function expandDietaryPreferences(preferences: DietaryPreference[]): DietaryPreference[] {
  const expanded = [...preferences];
  // Vegan always implies vegetarian
  if (preferences.includes(DIETARY_PREFERENCE.vegan)) {
    expanded.push(DIETARY_PREFERENCE.vegetarian);
  }
  return [...new Set(expanded)]; // Remove duplicates
}

/*
 * Calculates the dietary preferences for a sandwich based on its ingredients.
 * The result is the intersection of all ingredient preferences, with special handling:
 * - Vegan ingredients are treated as vegetarian (vegan implies vegetarian)
 * - Kosher is removed if both meat and dairy are present
 */
function setDietaryPreferences(ingredients: { dietaryPreferences?: DietaryPreference[] }[]): DietaryPreference[] {
  if (ingredients.length === 0) {
    return [];
  }

  // Expand preferences for each ingredient (vegan → vegetarian)
  const expandedPreferences = ingredients.map((ingredient) =>
    expandDietaryPreferences(ingredient.dietaryPreferences || []),
  );

  // Calculate intersection of all expanded preferences
  let intersection = [...(expandedPreferences[0] ?? [])];

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

const Sandwich = mongoose.model<ISandwich>('Sandwich', sandwichSchema);

export default Sandwich;
