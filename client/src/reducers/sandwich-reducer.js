const sandwichReducer = (state, action) => {
    switch (action.type) {
        case "ADD_INGREDIENT":
            return { ...state, ingredients: [...state.ingredients, action.payload] };
        case "REMOVE_INGREDIENT":
            return {
                ...state,
                ingredients: state.ingredients.filter(
                    (ingredient) => ingredient.ingredientId !== action.payload
                ),
            };
        case "MOVE_UP":
            const indexUp = state.ingredients.findIndex(
                (ingredient) => ingredient.ingredientId === action.payload
            );
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
        case "MOVE_DOWN":
            const indexDown = state.ingredients.findIndex(
                (ingredient) => ingredient.ingredientId === action.payload
            );
            if (indexDown < 0 || indexDown === state.ingredients.length - 1) return state;
            return {
                ...state,
                ingredients: [
                    ...state.ingredients.slice(0, indexDown),
                    state.ingredients[indexDown + 1],
                    state.ingredients[indexDown],
                    ...state.ingredients.slice(indexDown + 2),
                ],
            };
        case "RESET_SANDWICH":
            return {
                name: "",
                ingredients: [],
                comment: "",
            };
        case "SET_SANDWICH":
            return action.payload;
        case "SET_NAME":
            return { ...state, name: action.payload };
        case "SET_COMMENT":
            return { ...state, comment: action.payload };
        default:
            return state;
    }
};

export default sandwichReducer;
