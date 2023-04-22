import { createContext, useContext } from "react";

import useIngredients from "../hooks/use-ingredients";

const IngredientsGlobalContext = createContext();

const SandwichGlobalContextProvider = ({ children }) => {
    const {
        ingredients,
        ingredientsRawList,
        areIngredientsReady,
        forceFetchIngredients,
    } = useIngredients();

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

export default SandwichGlobalContextProvider;
