import {
  DIETARY_PREFERENCE,
  type DietaryPreference,
  type IngredientType,
  isBreadType,
  PRODUCT,
  SHAPE,
  type Shape,
  TYPE,
} from '@sandwicheck/shared';
import mongoose from 'mongoose';

const { Schema } = mongoose;

export interface IIngredient {
  name: string;
  type: IngredientType;
  shape?: Shape;
  imageBase: string;
  dietaryPreferences: DietaryPreference[];
  displayPriority: number;
}

export type IngredientDocument = mongoose.HydratedDocument<IIngredient>;

const ingredientSchema = new Schema<IIngredient>(
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
      enum: Object.values(SHAPE),
      validate: {
        validator: function (this: IIngredient) {
          return !isBreadType(this.type) || (isBreadType(this.type) && Boolean(this.shape));
        },
        message: `Shape is required when the ingredient type is '${TYPE.bread}'`,
      },
      required: function (this: IIngredient) {
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
          values: Object.values(DIETARY_PREFERENCE),
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
      transform: function (_doc, ret: Record<string, unknown>) {
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
      transform: function (_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        delete ret.__t;
      },
    },
  },
);

ingredientSchema.pre('save', function () {
  if (this.type !== TYPE.bread) {
    this.shape = undefined;
  }

  this.dietaryPreferences = [...new Set(this.dietaryPreferences)];
});

const Ingredient = mongoose.model<IIngredient>('Ingredient', ingredientSchema);

export default Ingredient;
