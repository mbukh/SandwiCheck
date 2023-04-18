import { createContext, useContext, useEffect, useState } from "react";

import { getAllIngredients } from "../services/apiIngredients";

const SandwichGlobalContext = createContext();

const SandwichGlobalContextProvider = ({ children }) => {
    const [ingredients, setIngredients] = useState([]);
    const [areIngredientsReady, setAreIngredientsReady] = useState(false);

    useEffect(() => {
        !areIngredientsReady &&
            (async () => {
                try {
                    const ingredientsData = await getAllIngredients();
                    setIngredients(ingredientsData);
                    setAreIngredientsReady(true);
                } catch (error) {
                    setAreIngredientsReady(false);
                }
            })();
    }, [areIngredientsReady]);

    return (
        <SandwichGlobalContext.Provider value={{ ingredients, areIngredientsReady }}>
            {children}
        </SandwichGlobalContext.Provider>
    );
};

export const useSandwichGlobalContext = () => useContext(SandwichGlobalContext);
export default SandwichGlobalContextProvider;
