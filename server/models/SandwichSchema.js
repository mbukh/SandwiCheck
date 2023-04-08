import mongoose from "mongoose";

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
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author ID is required"],
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
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (_, ret) {
                delete ret.__v;
            },
        },
        toObject: {
            transform: function (_, ret) {
                delete ret.__v;
            },
        },
    }
);

function breadValidator(ingredients) {
    return ingredients.length > 0 && ingredients[0].type === "Bread";
}

const Sandwich = mongoose.model("Sandwich", sandwichSchema);

export default Sandwich;
