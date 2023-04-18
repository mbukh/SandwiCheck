import { useState, useEffect } from "react";

import { logResponse } from "../utils/log";

import { getAllIngredients } from "../services/apiIngredients";

const useIngredients = () => {
    const [ingredients, setIngredients] = useState([]);
    const [areIngredientsReady, setAreIngredientsReady] = useState(false);

    useEffect(() => {
        if (areIngredientsReady) {
            return;
        }

        (async () => {
            const res = await getAllIngredients();

            if (!res) {
                setIngredients([]);
                setAreIngredientsReady(false);
                return;
            }

            setIngredients(res.data);
            setAreIngredientsReady(true);
        })();
    }, [areIngredientsReady]);

    return { ingredients, setIngredients, areIngredientsReady, setAreIngredientsReady };
};

export default useIngredients;
