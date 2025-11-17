import mongoose from 'mongoose';

import { TYPE, SHAPE, DIETARY_PREFERENCE, PRODUCT, isBreadType } from '../constants/ingredientsConstants.js';

const { Schema } = mongoose;

const ingredientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: [...Object.values(TYPE), ...Object.values(PRODUCT)],
        message: `Role must be either ${[...Object.values(TYPE), ...Object.values(PRODUCT)].join(', ')}`,
      },
      required: true,
    },
    shape: {
      type: String,
      enum: [...Object.values(SHAPE)],
      validate: {
        validator: function () {
          return !isBreadType(this.type) || (isBreadType(this.type) && this.shape);
        },
        message: `Shape is required when the ingredient type is '${TYPE.bread}'`,
      },
      required: function () {
        return isBreadType(this.type);
      },
    },
    imageBase: {
      type: String,
      required: true,
    },
    dietaryPreferences: [
      {
        type: String,
        enum: {
          values: [...Object.values(DIETARY_PREFERENCE)],
          message: `Dietary preferences must be either ${Object.values(DIETARY_PREFERENCE).join(', ')}`,
        },
      },
    ],
    displayPriority: {
      type: Number,
      min: [1, 'Display priority must be equal or greater than 1'],
      max: [100, 'Display priority must be less than or equal 100'],
      required: true,
      default: 100,
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
        delete ret.createdAt;
        delete ret.updatedAt;
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

ingredientSchema.pre('save', function (next) {
  if (this.type !== TYPE.bread) {
    this.shape = undefined;
  }

  this.dietaryPreferences = [...new Set(this.dietaryPreferences)];

  next();
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export default Ingredient;
