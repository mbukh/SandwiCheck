import { createContext, useContext } from "react";

import useIngredients from "../hooks/use-ingredients";

const SandwichGlobalContext = createContext();

const SandwichGlobalContextProvider = ({ children }) => {
    const { ingredients, areIngredientsReady } = useIngredients();

    return (
        <SandwichGlobalContext.Provider value={{ ingredients, areIngredientsReady }}>
            {children}
        </SandwichGlobalContext.Provider>
    );
};

export const useSandwichGlobalContext = () => useContext(SandwichGlobalContext);
export default SandwichGlobalContextProvider;
