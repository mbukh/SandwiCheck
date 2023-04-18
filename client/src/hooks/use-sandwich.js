import { useState, useEffect, useRef } from "react";

import { log, logResponse } from "../utils/log";

import {
    fetchSandwichById,
    createSandwich,
    readSandwichFromLocalStorage,
    updateSandwichToLocalStorage,
    deleteSandwichFromLocalStorage,
} from "../services/apiSandwiches";

const useSandwich = () => {
    const [currentIngredientType, setCurrentIngredientType] = useState("bread");
    const [isSavingSandwich, setIsSavingSandwich] = useState(false);
    const [sandwich, setSandwich] = useState({});
    const [gallerySandwiches, setGallerySandwiches] = useState(null);
    const timeout = useRef(null);

    useEffect(() => {
        const cachedUnexpiredSandwich = readSandwichFromLocalStorage();
        log("Sandwich retrieved from cache", cachedUnexpiredSandwich);
        setSandwich(cachedUnexpiredSandwich || {});
    }, [isSavingSandwich]);

    useEffect(() => {
        if (!isSavingSandwich) return;
        updateSandwichToLocalStorage(sandwich);
    }, [isSavingSandwich, sandwich]);

    const updateLocalSandwich = (sandwich) => {
        updateSandwichToLocalStorage(sandwich);
    };

    const fetchSandwich = async (sandwichId) => {
        const res = await fetchSandwichById(sandwichId);
        logResponse("🥪 Read sandwich", res);

        setSandwich(res.data || {});
    };

    const updateSandwich = async (newSandwichData) => {
        timeout.current && clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            updateSandwichToLocalStorage({
                ...sandwich,
                ...newSandwichData,
            });
        }, 200);
        setSandwich((prev) => ({
            ...prev,
            ...newSandwichData,
        }));
    };

    const clearSandwich = () => {
        setSandwich({});
        setCurrentIngredientType("");
        deleteSandwichFromLocalStorage();
        setTimeout(() => {
            setCurrentIngredientType("bread");
        }, 400);
    };

    const saveSandwich = async () => {
        setIsSavingSandwich(true);

        const res = await createSandwich(sandwich);
        logResponse("👽🥪 Create sandwich", res);

        if (!res.data) return null;

        clearSandwich();
        setIsSavingSandwich(false);

        return res.data;
    };

    return {
        currentIngredientType,
        setCurrentIngredientType,
        sandwich,
        setSandwich,
        updateSandwich,
        clearSandwich,
        saveSandwich,
        isSavingSandwich,
        setIsSavingSandwich,
        gallerySandwiches,
        setGallerySandwiches,
        fetchSandwich,
        updateLocalSandwich,
    };
};

export default useSandwich;
