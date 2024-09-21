import mongoose from 'mongoose';

import { DIETARY_PREFERENCES } from '../constants/ingredientsConstants.js';
import {
  ROLES,
  MAX_SANDWICHES_PER_DAY,
  MAX_TETHERED_CHILDREN,
  MAX_USER_NAME_LENGTH,
} from '../constants/usersConstants.js';
import { DAYS_OF_WEEK } from '../constants/daysOfWeek.js';

const { Schema } = mongoose;

const weekMenuSchema = new Schema(
  Object.fromEntries(
    DAYS_OF_WEEK.map((day) => [
      day,
      {
        type: [
          {
            sandwichId: {
              type: Schema.Types.ObjectId,
              ref: 'Sandwich',
            },
            quantity: {
              type: Number,
              default: 0,
            },
          },
        ],
        validate: {
          validator: validateDailyMenu,
          message: `Cannot add more than ${MAX_SANDWICHES_PER_DAY} sandwiches per day`,
        },
      },
    ]),
  ),
  { _id: false },
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [MAX_USER_NAME_LENGTH, `Name must be at most ${MAX_USER_NAME_LENGTH} characters long`],
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      unique: true,
      index: true,
      sparse: true, // unique for non-empty fields
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email is invalid'],
      required: [checkChildWithoutEmail, 'Email is required'],
    },
    password: {
      type: String,
      required: [checkChildWithoutEmail, 'Password is required '],
    },
    isTetheredChild: {
      type: Boolean,
      default: undefined,
    },
    roles: {
      type: [String],
      enum: {
        values: [...Object.values(ROLES)],
        message: `Role must be either ${Object.values(ROLES).join(', ')}`,
      },
      required: [true, 'Role is required'],
      default: ['user'],
    },
    profilePicture: { type: String },
    dietaryPreferences: {
      type: [String],
      enum: {
        values: Object.values(DIETARY_PREFERENCES),
        message: `Dietary preference must be one of ${Object.values(DIETARY_PREFERENCES).join(', ')}`,
      },
    },
    sandwiches: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Sandwich',
      },
    ],
    weekMenu: weekMenuSchema,
    favoriteSandwiches: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Sandwich',
      },
    ],
    parents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
  },
);

userSchema.pre('save', async function (next) {
  this.roles = [...new Set(this.roles)];
  this.dietaryPreferences = [...new Set(this.dietaryPreferences)];
  this.favoriteSandwiches = [...new Set(this.favoriteSandwiches)];

  // update tethered child if a child gets an email
  this.isTetheredChild = this.isTetheredChild && !this.email ? true : undefined;

  // Check tethered children count when creating a new user or when the name is modified
  if (this.isNew && this.isTetheredChild) {
    const childUserCount = await User.countDocuments({
      parents: this.parents[0],
      email: { $exists: false },
    });

    if (childUserCount >= MAX_TETHERED_CHILDREN) {
      const error = new Error(`You can only have up to ${MAX_TETHERED_CHILDREN} children with no email`);
      error.name = 'ChildUserLimitExceeded';
      return next(error);
    }
  }

  next();
});

function checkChildWithoutEmail() {
  return !this.isTetheredChild;
}

function validateDailyMenu(value) {
  const totalSandwiches = value.reduce((acc, day) => acc + day.quantity, 0);
  return totalSandwiches <= MAX_SANDWICHES_PER_DAY;
}

userSchema.virtual('firstName').get(function () {
  return this.name && this.name.split(' ')[0];
});

const User = mongoose.model('User', userSchema);

export default User;
