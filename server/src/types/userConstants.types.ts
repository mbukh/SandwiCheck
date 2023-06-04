import { ROLES } from "../constants/usersConstants.ts";

export type Roles = (typeof ROLES)[keyof typeof ROLES];
