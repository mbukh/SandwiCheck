import { useState, useCallback } from "react";

import { debug } from "../constants/";

import { ingredientTypes } from "../constants/";

import {
    readSandwichById,
    addSandwichToCurrentUser,
    readLatestSandwiches,
    readSandwichesOfCurrentUser,
    readSandwichesOfUserById,
} from "../services/apiSandwiches";

const useSandwich = () => {
    const [currentIngredientType, setCurrentIngredientType] = useState("bread");
    const [sandwich, setSandwich] = useState({});
    const [sandwichName, setSandwichName] = useState("");
    const [gallerySandwiches, setGallerySandwiches] = useState(null);

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

    const updateSandwich = useCallback(async (newSandwichData) => {
        localStorage.setItem(
            "sandwich",
            JSON.stringify({ ...newSandwichData, name: sandwichName })
        );
        setSandwich((prev) => ({
            ...prev,
            ...newSandwichData,
        }));
    }, [sandwichName]);

    const clearSandwich = useCallback(() => {
        setSandwich({});
        setCurrentIngredientType("");
        localStorage.removeItem("sandwich");
        setTimeout(() => {
            setCurrentIngredientType("bread");
        }, 400);
    }, []);

    const saveSandwich = useCallback(async () => {
        debug && console.log("Adding a sandwich to current user.");
        await addSandwichToCurrentUser({ ...sandwich, name: sandwichName });
        clearSandwich();
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
        gallerySandwiches,
        setGallerySandwiches,
        fetchUserSandwiches,
        fetchLatestSandwiches,
        fetchSandwich,
    };
};

export default useSandwich;
