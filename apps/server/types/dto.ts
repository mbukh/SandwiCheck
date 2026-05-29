/**
 * SHARED-READY: Request-body DTOs (Data Transfer Objects).
 *
 * These describe the *expected* shape of untrusted JSON request bodies. Fields
 * are intentionally optional/loose because the payload is validated at runtime
 * inside each controller; the DTO documents the contract and gives call sites
 * autocomplete + typo protection.
 *
 * Kept framework-agnostic so they can move to `packages/shared-*` later; the
 * client constructs exactly these payloads, so sharing them removes drift.
 * NOTE: the only non-primitive dependency is DietaryPreference (below), which is
 * itself SHARED-READY from constants/ingredientsConstants.ts — move it together.
 */
import type { DietaryPreference } from '../constants/ingredientsConstants.ts';

// ==== Auth ==== //

export interface SignupDto {
  name?: string;
  email?: string;
  password?: string;
  /** Validated at runtime to be `child` or `parent`. */
  role?: string;
  parentId?: string;
}

export interface LoginDto {
  email?: string;
  password?: string;
  parentId?: string;
}

export interface ChangePasswordDto {
  oldPassword?: string;
  newPassword?: string;
}

export interface ForgotPasswordDto {
  email?: string;
}

export interface ResetPasswordDto {
  newPassword?: string;
}

export interface ResendConfirmationDto {
  email?: string;
}

// ==== Child accounts ==== //

export interface CreateChildDto {
  name?: string;
}

export interface LoginChildDto {
  childId?: string;
}

// ==== Users ==== //

export interface UpdateUserDto {
  name?: string;
  email?: string;
  /** Validated at runtime to be a known role. */
  role?: string;
  dietaryPreferences?: DietaryPreference[];
  removeProfilePicture?: boolean;
  unlinkParentId?: string;
  unlinkChildId?: string;
}

// ==== Sandwiches ==== //

/** A single ingredient entry as received from the client (id may arrive under several keys). */
export interface SandwichIngredientInputDto {
  ingredientId?: string;
  id?: string;
  _id?: string;
  portion?: string;
}

export interface CreateSandwichDto {
  name?: string;
  ingredients?: SandwichIngredientInputDto[];
  comment?: string;
}

export type UpdateSandwichDto = CreateSandwichDto;

// ==== Week menu ==== //

export interface WeekMenuItemDto {
  sandwichId?: string;
}
