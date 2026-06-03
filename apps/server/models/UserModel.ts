import {
  type DayOfWeek,
  DAYS_OF_WEEK,
  DIETARY_PREFERENCE,
  type DietaryPreference,
  MAX_USER_NAME_LENGTH,
  ROLE,
  type Role,
} from '@sandwicheck/shared';
import mongoose from 'mongoose';
import { MAX_SANDWICHES_PER_DAY, MAX_TETHERED_CHILDREN } from '#constants/usersConstants.ts';

const { Schema } = mongoose;

export interface IDayMenuItem {
  sandwichId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IUser {
  name: string;
  email?: string;
  password?: string;
  isTetheredChild?: boolean;
  roles: Role[];
  profilePicture?: string;
  dietaryPreferences?: DietaryPreference[];
  sandwiches: mongoose.Types.ObjectId[];
  weekMenu?: Partial<Record<DayOfWeek, IDayMenuItem[]>>;
  favoriteSandwiches: mongoose.Types.ObjectId[];
  parents: mongoose.Types.ObjectId[];
  children: mongoose.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  inviteToken?: string;
  inviteTokenExpire?: Date;
  emailConfirmed?: boolean;
  emailConfirmationToken?: string;
  emailConfirmationExpire?: Date;
  emailConfirmationResendCount?: number;
  emailConfirmationResendCooldown?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserVirtuals {
  firstName?: string;
}

export type UserDocument = mongoose.HydratedDocument<IUser, IUserVirtuals>;

type UserModelType = mongoose.Model<IUser, Record<string, never>, Record<string, never>, IUserVirtuals, UserDocument>;

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

const userSchema = new Schema<IUser, UserModelType, Record<string, never>, Record<string, never>, IUserVirtuals>(
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
      select: false, // never loaded by default; auth paths opt in via .select('+password')
    },
    isTetheredChild: {
      type: Boolean,
      default: undefined,
    },
    roles: {
      type: [String],
      enum: {
        values: Object.values(ROLE),
        message: `Role must be either ${Object.values(ROLE).join(', ')}`,
      },
      required: [true, 'Role is required'],
      default: ['user'],
    },
    profilePicture: { type: String },
    dietaryPreferences: {
      type: [String],
      enum: {
        values: Object.values(DIETARY_PREFERENCE),
        message: `Dietary preference must be one of ${Object.values(DIETARY_PREFERENCE).join(', ')}`,
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
    inviteToken: {
      type: String,
      index: true,
      sparse: true, // only index documents that have a pending invite token
    },
    inviteTokenExpire: Date,
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
    emailConfirmationToken: {
      type: String,
      index: true,
      sparse: true, // Only index documents that have this field
    },
    emailConfirmationExpire: Date,
    emailConfirmationResendCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    emailConfirmationResendCooldown: {
      type: Date,
      default: undefined,
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
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.inviteToken;
        delete ret.inviteTokenExpire;
        delete ret.emailConfirmationToken;
        delete ret.emailConfirmationExpire;
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

userSchema.pre('save', async function () {
  this.roles = [...new Set(this.roles)];
  this.dietaryPreferences = [...new Set(this.dietaryPreferences)];
  this.favoriteSandwiches = [...new Set(this.favoriteSandwiches)];

  // update tethered child if a child gets an email
  this.isTetheredChild = this.isTetheredChild && !this.email ? true : undefined;

  // Check tethered children count when creating a new user or when the name is modified
  if (this.isNew && this.isTetheredChild && this.parents && this.parents.length > 0) {
    const childUserCount = await User.countDocuments({
      parents: this.parents[0],
      email: { $exists: false },
    });

    if (childUserCount >= MAX_TETHERED_CHILDREN) {
      const error = new Error(`You can only have up to ${MAX_TETHERED_CHILDREN} children with no email`);
      error.name = 'ChildUserLimitExceeded';
      throw error;
    }
  }
});

function checkChildWithoutEmail(this: IUser): boolean {
  return !this.isTetheredChild;
}

function validateDailyMenu(value: IDayMenuItem[]): boolean {
  const totalSandwiches = value.reduce((acc, day) => acc + (day.quantity ?? 0), 0);
  return totalSandwiches <= MAX_SANDWICHES_PER_DAY;
}

userSchema.virtual('firstName').get(function () {
  return this.name && this.name.split(' ')[0];
});

const User = mongoose.model<IUser, UserModelType>('User', userSchema);

export default User;
