/**
 * Request-body DTOs (Data Transfer Objects).
 *
 * These describe the *expected* shape of untrusted JSON request bodies. Fields
 * are intentionally optional/loose because the payload is validated at runtime
 * inside each controller; the DTO documents the contract and gives call sites
 * autocomplete + typo protection. The client constructs exactly these payloads.
 */
import type { DietaryPreference } from '../constants/ingredientsConstants.ts';

// ==== Auth ==== //

export interface SignupDto {
  name?: string;
  email?: string;
  password?: string;
  /** Validated at runtime to be `child` or `parent`. */
  role?: string;
  /** Single-use parent invite token (replaces the previous unauthenticated parentId linking). */
  inviteToken?: string;
}

export interface LoginDto {
  email?: string;
  password?: string;
  /** Parent invite token; links the account to the inviting parent on login. */
  inviteToken?: string;
  /**
   * Explicit consent to redeem `inviteToken` and be linked as a dependent. The server only
   * redeems the token when this is `true`, so a victim logging in through an attacker's invite
   * link is never silently attached to the attacker's account.
   */
  acceptInvite?: boolean;
}

/** Response payload for POST /auth/create-invite. */
export interface CreateInviteData {
  token: string;
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

/**
 * Response payload for a pending (email-confirmation-required) signup. Returned identically
 * whether the account was just created, an unconfirmed account was refreshed, or the email
 * already belongs to a confirmed account — so the endpoint never reveals which case occurred.
 */
export interface SignupPendingData {
  requiresEmailConfirmation: true;
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
