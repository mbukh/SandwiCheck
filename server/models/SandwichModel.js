import mongoose from "mongoose";

import { types, dietaryPreferences } from "../constants/ingredientsConstants.js";

import Ingredient from "./IngredientModel.js";

const { Schema } = mongoose;

const sandwichSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 15,
        },
        authorName: {
            type: String,
            required: [true, "Author name is required"],
            //  TODO: add pre middleware that add "people" when authorName is empty
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        votesCount: {
            type: Number,
            default: 0,
        },
        ingredients: [
            {
                type: Schema.Types.ObjectId,
                ref: "Ingredient",
                required: true,
                validate: [
                    breadValidator,
                    "A sandwich must have bread as the first ingredient",
                ],
            },
        ],
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
    const ingredients = await Ingredient.find({
        _id: { $in: this.ingredients },
    });

    this.dietaryPreferences = setDietaryPreferences(ingredients);

    next();
});

async function breadValidator(ingredients) {
    if (!ingredients.length) return false;

    const firstIngredient = await Ingredient.findById(ingredients[0]);
    return firstIngredient && firstIngredient.type === types.bread;
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
