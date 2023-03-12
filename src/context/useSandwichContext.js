import { createContext, useContext, useEffect, useState } from "react";

import { readAllIngredients } from "../services/apiIngredients";

const useSandwichContext = () => {
    const [ingredients, setIngredients] = useState([]);
    const [areIngredientsReady, setAreIngredientsReady] = useState(false);

    useEffect(() => {
        if (ingredients.length > 0) return;
        (async () => {
            try {
                const ingredientsData = await readAllIngredients();
                setIngredients(ingredientsData);
                setAreIngredientsReady(true);
            } catch (error) {
                setAreIngredientsReady(false);
            }
        })();
    }, [ingredients.length]);

    return { ingredients, areIngredientsReady };
};

export default useSandwichContext;
