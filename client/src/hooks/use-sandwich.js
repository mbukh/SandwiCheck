import { useState, useEffect, useRef, useReducer, useCallback } from "react";

import { log, logResponse } from "../utils/log";

import { TYPES } from "../constants/ingredients-constants";

import {
    fetchSandwichById,
    createSandwich,
    readSandwichFromCache,
    updateSandwichInCache,
    deleteSandwichFromCache,
} from "../services/api-sandwiches";

import sandwichReducer from "../reducers/sandwich-reducer";

const useSandwich = () => {
    const [currentIngredientType, setCurrentIngredientType] = useState(TYPES.bread);
    const [isSavingSandwich, setIsSavingSandwich] = useState(false);
    const [gallerySandwiches, setGallerySandwiches] = useState(null);

    const [sandwich, sandwichDispatch] = useReducer(sandwichReducer, {});

    // const timeout = useRef(null);

    useEffect(() => {
        const sandwichFromCache = readSandwichFromCache();
        log("Sandwich retrieved from cache", sandwichFromCache);

        if (sandwichFromCache) {
            sandwichDispatch({ type: "SET_SANDWICH", sandwich: sandwichFromCache });
        }
    }, [isSavingSandwich]);

    useEffect(() => {
        if (isSavingSandwich) {
            updateSandwichInCache(sandwich);
        }
    }, [isSavingSandwich, sandwich]);

    const getSandwich = useCallback(async (sandwichId) => {
        const res = await fetchSandwichById(sandwichId);
        logResponse("🥪 Read sandwich", res);

        sandwichDispatch({ type: "SET_SANDWICH", sandwich: res.date || {} });
    }, []);

    // const updateSandwich = async (newSandwichData) => {
    //     timeout.current && clearTimeout(timeout.current);
    //     timeout.current = setTimeout(() => {
    //         updateSandwichInCache({
    //             ...sandwich,
    //             ...newSandwichData,
    //         });
    //     }, 200);

    //     sandwichDispatch((prev) => ({
    //         ...prev,
    //         ...newSandwichData,
    //     }));
    // };

    const clearSandwich = () => {
        sandwichDispatch({ type: "CLEAR" });

        setCurrentIngredientType("");

        deleteSandwichFromCache();

        setTimeout(() => {
            setCurrentIngredientType(TYPES.bread);
        }, 400);
    };

    const saveSandwich = async () => {
        setIsSavingSandwich(true);

        const res = await createSandwich(sandwich);
        logResponse("👽 🥪 Create sandwich", res);

        if (!res.data) {
            return null;
        }

        clearSandwich();
        setIsSavingSandwich(false);

        return res.data;
    };

    return {
        currentIngredientType,
        setCurrentIngredientType,
        sandwich,
        sandwichDispatch,
        saveSandwich,
        isSavingSandwich,
        setIsSavingSandwich,
        gallerySandwiches,
        setGallerySandwiches,
        updateSandwichInCache,
        getSandwich,
    };
};

export default useSandwich;
