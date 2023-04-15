import mongoose from "mongoose";

import {
    dietaryPreferences,
    portions,
    isBreadType,
} from "../constants/ingredientsConstants.js";

import Ingredient from "./IngredientModel.js";

const { Schema } = mongoose;

const ingredientWithPortionSchema = new Schema(
    {
        ingredientId: {
            type: Schema.Types.ObjectId,
            ref: "Ingredient",
            required: true,
        },
        portion: {
            type: String,
            enum: [...Object.values(portions)],
            default: portions.full,
            required: true,
        },
    },
    {
        _id: false,
    }
);

const sandwichSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Sandwich name is required"],
            trim: true,
            minlength: [3, "Name field must be at least 3 characters long"],
            maxlength: [15, "Name field must be at most 15 characters long"],
        },
        authorName: {
            type: String,
            required: [true, "Author name is required"],
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        votesCount: {
            type: Number,
            default: 0,
        },
        ingredients: {
            type: [ingredientWithPortionSchema],
            required: true,
            validate: [
                ingredientsValidator,
                "A sandwich must have bread as the first ingredient and at least one more ingredient",
            ],
        },
        dietaryPreferences: [
            {
                type: String,
                enum: {
                    values: [...Object.values(dietaryPreferences)],
                    message: `Dietary preferences must be either ${Object.values(
                        dietaryPreferences
                    ).join(", ")}`,
                },
            },
        ],
        comment: {
            type: String,
            trim: true,
            maxlength: [100, "Keep your comment within 100 characters"],
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
    }
);

sandwichSchema.pre("save", async function (next) {
    const ingredientIds = this.ingredients.map((item) => item.ingredientId);
    const ingredients = await Ingredient.find({
        _id: { $in: ingredientIds },
    });

    this.dietaryPreferences = setDietaryPreferences(ingredients);

    next();
});

async function ingredientsValidator(ingredientsWithPortion) {
    if (ingredientsWithPortion.length < 2) return false;

    const firstIngredient = await Ingredient.findById(
        ingredientsWithPortion[0].ingredientId
    );
    return firstIngredient && isBreadType(firstIngredient.type);
}

function setDietaryPreferences(ingredients) {
    if (ingredients.length === 0) {
        return [];
    }

    // Create an array to store the intersection of all dietary preferences
    let intersection = ingredients[0].dietaryPreferences.slice();

    ingredients.slice(1).forEach((ingredient) => {
        intersection = intersection.filter((preference) =>
            ingredient.dietaryPreferences.includes(preference)
        );
    });

    return intersection;
}

const Sandwich = mongoose.model("Sandwich", sandwichSchema);

export default Sandwich;
