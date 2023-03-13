import { useState, useCallback, useEffect, useRef } from "react";

import { debug } from "../constants";

import { ingredientTypes } from "../constants";

import {
    readSandwichById,
    addSandwichToCurrentUser,
    readLatestSandwiches,
    readSandwichesOfCurrentUser,
    readSandwichesOfUserById,
    readSandwichFromLocalStorage,
    updateSandwichToLocalStorage,
    deleteSandwichFromLocalStorage,
} from "../services/apiSandwiches";

const useSandwich = () => {
    const [currentIngredientType, setCurrentIngredientType] = useState("bread");
    const [isSavingSandwich, setIsSavingSandwich] = useState(false);
    const [sandwich, setSandwich] = useState({});
    const [sandwichName, setSandwichName] = useState("");
    const [gallerySandwiches, setGallerySandwiches] = useState(null);
    const timeout = useRef(null);

    useEffect(() => {
        const cachedSandwich = readSandwichFromLocalStorage();
        debug && console.log("Sandwich retrieved from cache:", cachedSandwich);
        setSandwich(cachedSandwich || {});
        setSandwichName(cachedSandwich?.name || "");
    }, [isSavingSandwich]);

    useEffect(() => {
        updateSandwichToLocalStorage({ ...sandwich, name: sandwichName });
    }, [sandwich, sandwichName]);

    const fetchUserSandwiches = useCallback(async (uid = null) => {
        const sandwichesData = uid
            ? await readSandwichesOfUserById(uid)
            : await readSandwichesOfCurrentUser();
        debug && console.log("User sandwiches:", sandwichesData);
        setGallerySandwiches(sandwichesData);
    }, []);

    const fetchLatestSandwiches = useCallback(async (count = 30) => {
        const sandwichesData = await readLatestSandwiches(count);
        debug && console.log("Latest sandwiches:", sandwichesData);
        setGallerySandwiches(sandwichesData);
    }, []);

    const fetchSandwich = useCallback(async (sandwichId) => {
        const sandwichData = await readSandwichById(sandwichId);
        debug && console.log("Sandwich:", sandwichData);
        setSandwich(sandwichData);
    }, []);

    const updateSandwich = useCallback(
        async (newSandwichData) => {
            timeout.current && clearTimeout(timeout.current);
            timeout.current = setTimeout(() => {
                updateSandwichToLocalStorage({
                    ...sandwich,
                    ...newSandwichData,
                    name: sandwichName,
                });
            }, 200);
            setSandwich((prev) => ({
                ...prev,
                ...newSandwichData,
            }));
        },
        [sandwich, sandwichName]
    );

    const clearSandwich = useCallback(() => {
        setSandwich({});
        setSandwichName("");
        setCurrentIngredientType("");
        deleteSandwichFromLocalStorage();
        setTimeout(() => {
            setCurrentIngredientType("bread");
        }, 400);
    }, []);

    const saveSandwich = useCallback(async () => {
        setIsSavingSandwich(true);
        debug && console.log("Adding a sandwich to current user.");
        const newSandwichId = await addSandwichToCurrentUser({
            ...sandwich,
            name: sandwichName,
        });
        if (!newSandwichId) return null;
        clearSandwich();
        setIsSavingSandwich(false);
        return newSandwichId;
    }, [clearSandwich, sandwich, sandwichName]);

    return {
        ingredientTypes,
        currentIngredientType,
        setCurrentIngredientType,
        sandwich,
        setSandwich,
        updateSandwich,
        clearSandwich,
        sandwichName,
        setSandwichName,
        saveSandwich,
        isSavingSandwich,
        setIsSavingSandwich,
        gallerySandwiches,
        setGallerySandwiches,
        fetchUserSandwiches,
        fetchLatestSandwiches,
        fetchSandwich,
    };
};

export default useSandwich;
