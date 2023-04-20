import { createContext, useContext } from "react";

import useIngredients from "../hooks/use-ingredients";

const IngredientsGlobalContext = createContext();

const SandwichGlobalContextProvider = ({ children }) => {
    const { ingredients, areIngredientsReady } = useIngredients();

    return (
        <IngredientsGlobalContext.Provider value={{ ingredients, areIngredientsReady }}>
            {children}
        </IngredientsGlobalContext.Provider>
    );
};

export const useIngredientsGlobalContext = () => useContext(IngredientsGlobalContext);

export default SandwichGlobalContextProvider;
