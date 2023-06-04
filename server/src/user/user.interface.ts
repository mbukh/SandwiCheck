import { Document, Types } from "mongoose";
import { DaysOfWeek } from "../types/daysOfWeek.types.ts";
import { Roles } from "../types/userConstants.types.ts";

interface WeekMenuItem {
    sandwichId: string;
    quantity: number;
}

export type WeekMenu = {
    [K in DaysOfWeek]?: WeekMenuItem[];
};

interface User extends Document {
    name: string;
    email: string;
    password: string;
    isTetheredChild?: boolean;
    roles: Roles[];
    profilePicture?: string;
    dietaryPreferences: string[];
    sandwiches: Types.ObjectId[];
    weekMenu?: WeekMenu;
    favoriteSandwiches: Types.ObjectId[];
    parents: Types.ObjectId[];
    children: Types.ObjectId[];
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    firstName?: string;
}

export default User;
