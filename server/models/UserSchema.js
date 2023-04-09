import mongoose from "mongoose";

import bcrypt from "bcryptjs";

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
        password: { type: String, required: [true, "Password field is required"] },
        profilePicture: { type: String },
        roles: {
            type: [String],
            enum: {
                values: ["user", "parent", "child", "admin"],
                message: 'Role must be either "user", "parent", "child" or "admin"',
            },
            required: [true, "Type field is required"],
            default: ["user"],
        },
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
    if (this.isModified("password")) {
        if (this.password.length < 5) {
            return next(
                new Error(
                    "A password length should be at least 5 alphanumeric characters"
                )
            );
        }

        this.password = await bcrypt.hash(
            this.password,
            Number(process.env.BCRYPT_SALT_ROUNDS)
        );
    }

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
