import { createContext, useContext } from "react";

import useAuthContext from "./UserAuthContext";
import useSandwichContext from "./useSandwichContext";

const globalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
    const authContext = useAuthContext();
    const sandwichContext = useSandwichContext();

    return (
        <globalContext.Provider
            value={{
                ...authContext,
                ...sandwichContext,
            }}
        >
            {children}
        </globalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(globalContext);
};
