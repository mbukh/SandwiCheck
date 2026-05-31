import { PORTION, TYPE } from '@sandwicheck/shared';
import { DEFAULT_PORTION, getNextPortion } from '@/constants/ingredients-constants';
import type { BuilderSandwich, SandwichLayer } from '@/types/domain';
import { ensureLayerInstanceIds, withLayerInstanceId } from '@/utils/layer-instance-utils';

export const SANDWICH_ACTION = {
  ADD_INGREDIENT: 'ADD_INGREDIENT',
  INSERT_INGREDIENT_AT: 'INSERT_INGREDIENT_AT',
  REMOVE_INGREDIENT: 'REMOVE_INGREDIENT',
  REMOVE_INGREDIENTS_OF_TYPE: 'REMOVE_INGREDIENTS_OF_TYPE',
  MOVE_UP_INGREDIENT: 'MOVE_UP_INGREDIENT',
  MOVE_DOWN_INGREDIENT: 'MOVE_DOWN_INGREDIENT',
  INCREASE_PORTION: 'INCREASE_PORTION',
  CYCLE_PORTION: 'CYCLE_PORTION',
  DECREASE_PORTION: 'DECREASE_PORTION',
  UPDATE_INGREDIENTS: 'UPDATE_INGREDIENTS',
  UPDATE_SANDWICH: 'UPDATE_SANDWICH',
  SET_NAME: 'SET_NAME',
  SET_COMMENT: 'SET_COMMENT',
} as const;

export type SandwichAction =
  | { type: typeof SANDWICH_ACTION.ADD_INGREDIENT; payload: SandwichLayer }
  | { type: typeof SANDWICH_ACTION.INSERT_INGREDIENT_AT; payload: { ingredient: SandwichLayer; index: number } }
  | { type: typeof SANDWICH_ACTION.REMOVE_INGREDIENT; payload: string }
  | { type: typeof SANDWICH_ACTION.REMOVE_INGREDIENTS_OF_TYPE; payload: string }
  | { type: typeof SANDWICH_ACTION.MOVE_UP_INGREDIENT; payload: string }
  | { type: typeof SANDWICH_ACTION.MOVE_DOWN_INGREDIENT; payload: string }
  | { type: typeof SANDWICH_ACTION.INCREASE_PORTION; payload: string }
  | { type: typeof SANDWICH_ACTION.CYCLE_PORTION; payload: string }
  | { type: typeof SANDWICH_ACTION.DECREASE_PORTION; payload: string }
  | { type: typeof SANDWICH_ACTION.UPDATE_INGREDIENTS; payload: SandwichLayer[] }
  | { type: typeof SANDWICH_ACTION.UPDATE_SANDWICH; payload: BuilderSandwich & { forceNewIds?: boolean } }
  | { type: typeof SANDWICH_ACTION.SET_NAME; payload: string }
  | { type: typeof SANDWICH_ACTION.SET_COMMENT; payload: string };

/** Matches an ingredient by layerInstanceId or id (for remove/move/portion ops). */
const matchesIngredient = (ingredient: SandwichLayer, targetId: string): boolean =>
  ingredient.layerInstanceId === targetId || ingredient.id === targetId;

const sandwichReducer = (state: BuilderSandwich, action: SandwichAction): BuilderSandwich => {
  switch (action.type) {
    case SANDWICH_ACTION.ADD_INGREDIENT: {
      return {
        ...state,
        ingredients: [...state.ingredients, withLayerInstanceId({ portion: DEFAULT_PORTION, ...action.payload })],
      };
    }
    case SANDWICH_ACTION.INSERT_INGREDIENT_AT: {
      const { ingredient, index } = action.payload;
      const newIngredients = [...state.ingredients];
      // Insert at index + 1 (after the specified index)
      newIngredients.splice(index + 1, 0, withLayerInstanceId({ portion: DEFAULT_PORTION, ...ingredient }));
      return {
        ...state,
        ingredients: newIngredients,
      };
    }
    case SANDWICH_ACTION.REMOVE_INGREDIENT: {
      const targetId = action.payload;
      const indexToRemove = state.ingredients.findIndex((ingredient) => matchesIngredient(ingredient, targetId));
      if (indexToRemove === -1) return state;

      // Prevent removing bread (bread is always at index 0)
      const ingredientToRemove = state.ingredients[indexToRemove];
      if (ingredientToRemove?.type === TYPE.bread) return state; // Don't remove bread

      return {
        ...state,
        ingredients: state.ingredients.filter((_, index) => index !== indexToRemove),
      };
    }
    case SANDWICH_ACTION.REMOVE_INGREDIENTS_OF_TYPE: {
      // Prevent removing bread type
      if (action.payload === TYPE.bread) {
        return state; // Don't remove bread
      }
      return {
        ...state,
        ingredients: state.ingredients.filter((ingredient) => ingredient.type !== action.payload),
      };
    }
    case SANDWICH_ACTION.MOVE_UP_INGREDIENT: {
      const indexDown = state.ingredients.findIndex((ingredient) => matchesIngredient(ingredient, action.payload));
      if (indexDown === -1 || indexDown === state.ingredients.length - 1) return state;
      const current = state.ingredients[indexDown];
      const next = state.ingredients[indexDown + 1];
      if (!current || !next) return state;
      return {
        ...state,
        ingredients: [
          ...state.ingredients.slice(0, indexDown),
          next,
          current,
          ...state.ingredients.slice(indexDown + 2),
        ],
      };
    }
    case SANDWICH_ACTION.MOVE_DOWN_INGREDIENT: {
      const indexUp = state.ingredients.findIndex((ingredient) => matchesIngredient(ingredient, action.payload));
      if (indexUp <= 0) return state;
      const current = state.ingredients[indexUp];
      const previous = state.ingredients[indexUp - 1];
      if (!current || !previous) return state;
      return {
        ...state,
        ingredients: [
          ...state.ingredients.slice(0, indexUp - 1),
          current,
          previous,
          ...state.ingredients.slice(indexUp + 1),
        ],
      };
    }
    case SANDWICH_ACTION.INCREASE_PORTION: {
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient) =>
          matchesIngredient(ingredient, action.payload)
            ? {
                ...ingredient,
                portion: ingredient.portion === PORTION.half ? PORTION.full : PORTION.double,
              }
            : ingredient,
        ),
      };
    }
    case SANDWICH_ACTION.CYCLE_PORTION: {
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient) =>
          matchesIngredient(ingredient, action.payload)
            ? {
                ...ingredient,
                portion: getNextPortion(ingredient.portion),
              }
            : ingredient,
        ),
      };
    }
    case SANDWICH_ACTION.DECREASE_PORTION: {
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient) =>
          matchesIngredient(ingredient, action.payload)
            ? {
                ...ingredient,
                portion: ingredient.portion === PORTION.double ? PORTION.full : PORTION.half,
              }
            : ingredient,
        ),
      };
    }
    case SANDWICH_ACTION.UPDATE_INGREDIENTS: {
      /*
       * Don't filter unconfirmed layers here - allow them during active editing.
       * They are filtered on load or when recreating via UPDATE_SANDWICH.
       */
      return { ...state, ingredients: ensureLayerInstanceIds(action.payload) };
    }
    case SANDWICH_ACTION.UPDATE_SANDWICH: {
      // Force new layerInstanceIds when resetting/randomizing to ensure React re-renders properly
      const { forceNewIds = false, ...payloadWithoutFlag } = action.payload;
      // Filter out unconfirmed layers when recreating layers
      const confirmedIngredients = (payloadWithoutFlag.ingredients ?? []).filter(
        (ingredient) => !ingredient.unconfirmed,
      );
      return {
        ...payloadWithoutFlag,
        ingredients: ensureLayerInstanceIds(confirmedIngredients, forceNewIds),
      };
    }
    case SANDWICH_ACTION.SET_NAME: {
      return { ...state, name: action.payload };
    }
    case SANDWICH_ACTION.SET_COMMENT: {
      return { ...state, comment: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default sandwichReducer;
