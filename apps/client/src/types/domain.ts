import type { DayOfWeek, DietaryPreference, IngredientType, Portion, Role, Shape } from '@sandwicheck/shared';

/** An ingredient as served by the API (`_id` already mapped to `id` by the server). */
export interface Ingredient {
  id: string;
  name: string;
  type: IngredientType;
  shape?: Shape;
  imageBase: string;
  dietaryPreferences: DietaryPreference[];
  displayPriority: number;
}

/**
 * A sandwich layer in the builder: a hydrated ingredient plus its portion and
 * per-instance metadata. `ingredientId` mirrors the server's stored reference
 * for layers that arrive un-hydrated from a payload.
 */
export interface SandwichLayer extends Ingredient {
  portion?: Portion;
  layerInstanceId?: string;
  unconfirmed?: boolean;
  ingredientId?: string;
}

/**
 * A sandwich layer as it arrives on the wire: only the ingredient reference and portion. The
 * server does NOT populate the catalog fields (name/type/image…); the client hydrates them from
 * the ingredients list. (`id` appears on builder-originated payloads as a fallback reference.)
 */
export interface WireSandwichLayer {
  ingredientId?: string;
  id?: string;
  portion?: Portion;
}

/**
 * A sandwich as served by the API. Wire dates arrive as ISO strings. `ingredients` are
 * un-hydrated references — use HydratedSandwich (via hydrateSandwichIngredientsData) once the
 * catalog fields are filled in.
 */
export interface Sandwich {
  id: string;
  name: string;
  authorName: string;
  authorId?: string;
  image: string;
  votesCount: number;
  ingredients: WireSandwichLayer[];
  dietaryPreferences: DietaryPreference[];
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

/** A Sandwich whose layers have been hydrated with their full catalog data. */
export type HydratedSandwich = Omit<Sandwich, 'ingredients'> & { ingredients: SandwichLayer[] };

export interface DayMenuItem {
  sandwichId: string;
  quantity: number;
}

export type WeekMenu = Partial<Record<DayOfWeek, DayMenuItem[]>>;

/** A user as served by the API (sensitive fields stripped; refs populated). */
export interface User {
  id: string;
  name: string;
  firstName?: string;
  email?: string;
  isTetheredChild?: boolean;
  roles: Role[];
  profilePicture?: string;
  dietaryPreferences?: DietaryPreference[];
  /** Login/signup/admin responses send sandwich IDs; populated responses send full sandwiches. */
  sandwiches: Array<string | Sandwich>;
  weekMenu?: WeekMenu;
  favoriteSandwiches: string[];
  parents: User[];
  children: User[];
  emailConfirmed?: boolean;
  emailConfirmationResendCount?: number;
  emailConfirmationResendCooldown?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** The current (possibly logged-out) user; an empty object means "no session". */
export type CurrentUser = Partial<User>;

/** Payload of GET /auth/session. */
export interface Session {
  activeUser?: User;
  parentUser?: User | null;
  actingAsChild?: boolean;
}

/** Mutable sandwich-builder state held by the reducer. */
export interface BuilderSandwich {
  name: string;
  ingredients: SandwichLayer[];
  comment?: string;
  id?: string;
  authorName?: string;
  authorId?: string;
  image?: string;
  votesCount?: number;
  dietaryPreferences?: DietaryPreference[];
  createdAt?: string;
  updatedAt?: string;
}
