import { useState, useEffect, useReducer, useCallback } from "react";

import { log, logResponse } from "../utils/log";

import { TYPES } from "../constants/ingredients-constants";

import { EMPTY_SANDWICH } from "../constants/sandwich-constants";

import {
    fetchSandwichById,
    createSandwich,
    readSandwichFromCache,
    updateSandwichInCache,
    deleteSandwichFromCache,
} from "../services/api-sandwiches";

import sandwichReducer from "../reducers/sandwich-reducer";

const useSandwich = () => {
    const [currentType, setCurrentType] = useState(TYPES.bread);
    const [isSavingSandwich, setIsSavingSandwich] = useState(false);
    const [gallerySandwiches, setGallerySandwiches] = useState(null);

    const [sandwich, sandwichDispatch] = useReducer(sandwichReducer, EMPTY_SANDWICH);

    // const timeout = useRef(null);

    useEffect(() => {
        const sandwichFromCache = readSandwichFromCache();

        log("Sandwich retrieved from cache", sandwichFromCache);

        if (sandwichFromCache) {
            sandwichDispatch({ type: "UPDATE_SANDWICH", payload: sandwichFromCache });
        }
    }, [isSavingSandwich]);

    useEffect(() => {
        updateSandwichInCache(sandwich);
    }, [isSavingSandwich, sandwich]);

    const getSandwich = useCallback(async (sandwichId) => {
        const res = await fetchSandwichById(sandwichId);
        logResponse("🥪 Read sandwich", res);

        sandwichDispatch({
            type: "UPDATE_INGREDIENTS",
            payload: res.date || EMPTY_SANDWICH,
        });
    }, []);

    const clearSandwich = () => {
        sandwichDispatch({ type: "UPDATE_INGREDIENTS", payload: EMPTY_SANDWICH });

        setCurrentType("");

        deleteSandwichFromCache();

        setTimeout(() => {
            setCurrentType(TYPES.bread);
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
        currentType,
        setCurrentType,
        sandwich,
        sandwichDispatch,
        saveSandwich,
        isSavingSandwich,
        setIsSavingSandwich,
        gallerySandwiches,
        setGallerySandwiches,
        getSandwich,
    };
};

export default useSandwich;
