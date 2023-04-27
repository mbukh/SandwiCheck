import { createContext, useContext, useEffect, useState } from "react";

import { getAllIngredients } from "../services/api-ingredients";

import { groupIngredientsByTypes } from "../utils/ingredients-utils";

const IngredientsGlobalContext = createContext();

const IngredientsGlobalContextProvider = ({ children }) => {
    const [ingredients, setIngredients] = useState({});
    const [areIngredientsReady, setAreIngredientsReady] = useState(false);
    const [ingredientsRawList, setIngredientsRawList] = useState([]);
    const [rerenderIndex, setRerenderIndex] = useState(0);

    const forceFetchIngredients = () => {
        setRerenderIndex((prev) => prev + 1);
    };

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

            setIngredients(groupIngredientsByTypes(res.data));
            setIngredientsRawList(res.data);
            setAreIngredientsReady(true);
        })();
    }, [areIngredientsReady, rerenderIndex]);

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
