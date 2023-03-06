import { useEffect, useState } from "react";

import { debug } from "../constants/debug";

import { ingredientTypes } from "../constants/ingredientTypes";
import { useUserAuth } from "../context/UserAuthContext";

import { readIngredientsCollection } from "../services/apiIngredients";
import { createFavoriteSandwich } from "../services/apiSandwiches";

const useIngredients = () => {
    const [ingredients, setIngredients] = useState({});
    const [sandwich, setSandwich] = useState({});
    const [currentIngredientType, setCurrentIngredientType] = useState("bread");
    const [breadShape, setBreadShape] = useState("");
    const { user } = useUserAuth();

    useEffect(() => {
        const fetchAllIngredients = async () => {
            try {
                const valuesArray = await Promise.all(
                    ingredientTypes.map((ingredientType) =>
                        readIngredientsCollection(ingredientType)
                    )
                );
                const ingredientsAsObject = valuesArray.reduce(
                    (a, v, idx) => ({ ...a, [ingredientTypes[idx]]: v }),
                    {}
                );
                debug && console.log("All ingredients:", ingredientsAsObject);
                setIngredients(ingredientsAsObject);
            } catch (error) {
                debug &&
                    console.log(
                        "Not all ingredients retrieved: ",
                        error.message
                    );
            }
        };
        fetchAllIngredients();
        return () => clearSandwich();
    }, []);

    const clearSandwich = () => {
        setSandwich({});
        setBreadShape("");
        setCurrentIngredientType("");
    };

    const saveSandwich = async () => {
        await createFavoriteSandwich(sandwich, user.uid);
        clearSandwich();
    };

    return {
        ingredients,
        currentIngredientType,
        setCurrentIngredientType,
        breadShape,
        setBreadShape,
        sandwich,
        setSandwich,
        clearSandwich,
        saveSandwich,
    };
};

export default useIngredients;
