import mongoose from "mongoose";

const { Schema } = mongoose;

const ingredientSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        imageBase: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["bread", "protein", "cheese", "topping", "condiment"],
            required: true,
        },
        isKosher: {
            type: Boolean,
            default: true,
        },
        isHalal: {
            type: Boolean,
            default: true,
        },
    },
    {
        toJSON: {
            transform: function (_, ret) {
                delete ret.__v;
                delete ret.__t;
            },
        },
        toObject: {
            transform: function (_, ret) {
                delete ret.__v;
                delete ret.__t;
            },
        },
    }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;

// =============================== //
// ===  Type-specific schemas === //

const breadSchema = new Schema({
    shape: {
        type: String,
        enum: ["long", "trapezoid", "round"],
        required: true,
    },
});

const proteinSchema = new Schema({
    half: { type: String, required: true },
    full: { type: String, required: true },
    double: { type: String, required: true },
});

// cct = condiment, cheese, topping
const cctSchema = new Schema({
    heavy: { type: String, required: true },
    normal: { type: String, required: true },
    light: { type: String, required: true },
});

const Bread = Ingredient.discriminator("Bread", breadSchema);
const Protein = Ingredient.discriminator("Protein", proteinSchema);
const Cheese = Ingredient.discriminator("Cheese", cctSchema);
const Topping = Ingredient.discriminator("Topping", cctSchema);
const Condiment = Ingredient.discriminator("Condiment", cctSchema);

export { Bread, Protein, Cheese, Topping, Condiment };
