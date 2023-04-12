import mongoose from "mongoose";

import { roles as userRoles } from "../constants/usersConstants.js";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name field is required"],
            trim: true,
            minlength: [3, "Name field must be at least 3 characters long"],
            maxlength: [50, "Name field must be at most 50 characters long"],
        },
        email: {
            type: String,
            required: [true, "Email field is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email field is invalid"],
        },
        password: {
            type: String,
            required: [true, "Password field is required"],
        },
        profilePicture: { type: String },
        roles: {
            type: [String],
            enum: {
                values: [...Object.values(userRoles)],
                message: `Role must be either ${Object.values(userRoles).join(", ")}`,
            },
            required: [true, "Role is required"],
            default: ["user"],
        },
        dietaryPreferences: {
            type: [String],
            enum: {
                values: ["vegetarian", "kosher", "vegan", "halal"],
                message:
                    'Dietary preference must be one of "vegetarian", "kosher", "vegan", or "halal"',
            },
        },
        sandwiches: [
            {
                type: Schema.Types.ObjectId,
                ref: "Sandwich",
            },
        ],
        favoriteSandwiches: [
            {
                type: Schema.Types.ObjectId,
                ref: "Sandwich",
            },
        ],
        parents: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        children: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        resetPasswordToken: String,
        resetPasswordExpire: Date,
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
                delete ret.password;
                delete ret.resetPasswordToken;
                delete ret.resetPasswordExpire;
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

userSchema.pre("save", async function (next) {
    this.roles = [...new Set(this.roles)];
    this.dietaryPreferences = [...new Set(this.dietaryPreferences)];
    this.favoriteSandwiches = [...new Set(this.favoriteSandwiches)];
    this.parents = [...new Set(this.parents)];
    this.children = [...new Set(this.children)];

    next();
});

// Post middleware to update sandwich authorName field
userSchema.post("save", async function (doc, next) {
    if (this.isModified("name")) {
        const userId = this.id;
        const user = await mongoose.model("User").findById(userId);
        await mongoose
            .model("Sandwich")
            .updateMany({ userId }, { authorName: user.firstName });
    }
    next();
});

userSchema.virtual("firstName").get(function () {
    return this.name && this.name.split(" ")[0];
});

const User = mongoose.model("User", userSchema);

export default User;
