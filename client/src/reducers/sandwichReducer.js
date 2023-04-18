const sandwichReducer = (state, action) => {
    switch (action.type) {
        case "ADD_INGREDIENT":
            return [
                ...state,
                {
                    ingredientId: action.ingredientId,
                    type: action.ingredientType,
                    portion: action.portion,
                },
            ];
        case "REMOVE_INGREDIENT":
            return state.filter((ingredient, index) => index !== action.index);
        case "MOVE_FORWARD":
            if (action.index === state.length - 1) return state;
            return state.map((ingredient, index) => {
                if (index === action.index) {
                    return state[index + 1];
                } else if (index === action.index + 1) {
                    return state[index - 1];
                }
                return ingredient;
            });
        case "MOVE_BACKWARD":
            if (action.index === 0) return state;
            return state.map((ingredient, index) => {
                if (index === action.index) {
                    return state[index - 1];
                } else if (index === action.index - 1) {
                    return state[index + 1];
                }
                return ingredient;
            });
        default:
            return state;
    }
};
