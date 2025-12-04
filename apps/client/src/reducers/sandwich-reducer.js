import { DEFAULT_PORTION, PORTION, TYPE } from '../constants/ingredients-constants';

/*
 * sandwich = {
 *     name: "",
 *     ingredients: [{ id, ingredientType, portion }],
 *     comment: "",
 * };
 */

const sandwichReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_INGREDIENT': {
      return {
        ...state,
        ingredients: [...state.ingredients, { portion: DEFAULT_PORTION, ...action.payload }],
      };
    }
    case 'INSERT_INGREDIENT_AT': {
      const { ingredient, index } = action.payload;
      const newIngredients = [...state.ingredients];
      // Insert at index + 1 (after the specified index)
      newIngredients.splice(index + 1, 0, { portion: DEFAULT_PORTION, ...ingredient });
      return {
        ...state,
        ingredients: newIngredients,
      };
    }
    case 'REMOVE_INGREDIENT': {
      // Prevent removing bread (bread is always at index 0)
      const ingredientToRemove = state.ingredients.find((ing) => ing.id === action.payload);
      if (ingredientToRemove?.type === TYPE.bread) {
        return state; // Don't remove bread
      }
      return {
        ...state,
        ingredients: state.ingredients.filter((ingredient) => ingredient.id !== action.payload),
      };
    }
    case 'REMOVE_INGREDIENTS_OF_TYPE': {
      // Prevent removing bread type
      if (action.payload === TYPE.bread) {
        return state; // Don't remove bread
      }
      return {
        ...state,
        ingredients: state.ingredients.filter((ingredient) => ingredient.type !== action.payload),
      };
    }
    case 'MOVE_UP_INGREDIENT': {
      const indexDown = state.ingredients.findIndex((ingredient) => ingredient.id === action.payload);
      if (indexDown === -1 || indexDown === state.ingredients.length - 1) return state;
      return {
        ...state,
        ingredients: [
          ...state.ingredients.slice(0, indexDown),
          state.ingredients[indexDown + 1],
          state.ingredients[indexDown],
          ...state.ingredients.slice(indexDown + 2),
        ],
      };
    }
    case 'MOVE_DOWN_INGREDIENT': {
      const indexUp = state.ingredients.findIndex((ingredient) => ingredient.id === action.payload);
      if (indexUp <= 0) return state;
      return {
        ...state,
        ingredients: [
          ...state.ingredients.slice(0, indexUp - 1),
          state.ingredients[indexUp],
          state.ingredients[indexUp - 1],
          ...state.ingredients.slice(indexUp + 1),
        ],
      };
    }
    case 'INCREASE_PORTION': {
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient) =>
          ingredient.id === action.payload
            ? {
                ...ingredient,
                portion: ingredient.portion === PORTION.half ? PORTION.full : PORTION.double,
              }
            : ingredient,
        ),
      };
    }
    case 'CYCLE_PORTION': {
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient) =>
          ingredient.id === action.payload
            ? {
                ...ingredient,
                portion: getNextPortion(ingredient.portion),
              }
            : ingredient,
        ),
      };
    }
    case 'DECREASE_PORTION': {
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient) =>
          ingredient.id === action.payload
            ? {
                ...ingredient,
                portion: ingredient.portion === PORTION.double ? PORTION.full : PORTION.half,
              }
            : ingredient,
        ),
      };
    }
    case 'UPDATE_INGREDIENTS': {
      return { ...state, ingredients: action.payload };
    }
    case 'UPDATE_SANDWICH': {
      return action.payload;
    }
    case 'SET_NAME': {
      return { ...state, name: action.payload };
    }
    case 'SET_COMMENT': {
      return { ...state, comment: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default sandwichReducer;

// UTILS

function getNextPortion(currentPortion) {
  const portionValues = Object.values(PORTION);
  const currentIndex = portionValues.indexOf(currentPortion);

  // If the current portion is the last in the array, return the first portion
  if (currentIndex === portionValues.length - 1) {
    return portionValues[0];
  }

  // Otherwise, return the next portion in the array
  return portionValues[currentIndex + 1];
}
