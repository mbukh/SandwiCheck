import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { log } from "../utils/log";

import { getAllIngredients } from "../services/api-ingredients";

import { groupIngredientsByTypes } from "../utils/ingredients-utils";

import { useAuthGlobalContext } from "./AuthGlobalContext";

const IngredientsGlobalContext = createContext();

const IngredientsGlobalContextProvider = ({ children }) => {
    const [ingredients, setIngredients] = useState({});
    const [areIngredientsReady, setAreIngredientsReady] = useState(false);
    const [ingredientsRawList, setIngredientsRawList] = useState([]);
    const { currentUser, isCurrentUserReady } = useAuthGlobalContext();

    const forceFetchIngredients = useCallback(() => {
        log("Forcing fetch ingredients");
        setAreIngredientsReady(false);
    }, []);

    useEffect(() => {
        if (areIngredientsReady || !isCurrentUserReady) {
            return;
        }

        (async () => {
            const dietaryPreferences = currentUser.id
                ? currentUser.dietaryPreferences
                : [];

            const res = await getAllIngredients({ dietaryPreferences });
            if (!res) {
                setIngredients([]);
                return;
            }

            setIngredients(groupIngredientsByTypes(res.data));
            setIngredientsRawList(res.data);

            setAreIngredientsReady(true);
        })();
    }, [areIngredientsReady, isCurrentUserReady, currentUser]);

    return (
        <IngredientsGlobalContext.Provider
            value={{
                ingredients,
                ingredientsRawList,
                areIngredientsReady,
                forceFetchIngredients,
            }}
        >
            {children}
        </IngredientsGlobalContext.Provider>
    );
};

export const useIngredientsGlobalContext = () => useContext(IngredientsGlobalContext);

export default IngredientsGlobalContextProvider;
