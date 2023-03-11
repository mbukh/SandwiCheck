import { useEffect, useState, useCallback } from "react";

import { debug } from "../constants/";

import { ingredientTypes } from "../constants/";

import { readAllIngredients } from "../services/apiIngredients";
import {
    readSandwichById,
    addSandwichToCurrentUser,
    readLatestSandwiches,
    readSandwichesOfCurrentUser,
    readSandwichesOfUserById,
} from "../services/apiSandwiches";

const useSandwich = () => {
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [ingredients, setIngredients] = useState({});
    const [currentIngredientType, setCurrentIngredientType] = useState("bread");
    const [sandwich, setSandwich] = useState();
    const [sandwichName, setSandwichName] = useState("");
    const [userSandwiches, setUserSandwiches] = useState(null);

    useEffect(() => {
        const fetchAllIngredients = async () => {
            const ingredientsData = await readAllIngredients();
            debug && console.log("All ingredients:", ingredientsData);
            setIngredients(ingredientsData);
            setSandwich({ bread: ingredientsData["bread"][0].id });
            setIsDataLoading(false);
        };
        fetchAllIngredients();
        return () => {
            clearSandwich();
            setIsDataLoading(true);
        };
    }, []);

    const fetchUserSandwiches = useCallback(async (uid = null) => {
        const sandwichesData = uid
            ? await readSandwichesOfUserById(uid)
            : await readSandwichesOfCurrentUser();
        debug && console.log("User sandwiches:", sandwichesData);
        setUserSandwiches(sandwichesData);
    }, []);

    const fetchLatestSandwiches = useCallback(async (count = 30) => {
        const sandwichesData = await readLatestSandwiches(count);
        debug && console.log("Latest sandwiches:", sandwichesData);
        setUserSandwiches(sandwichesData);
    }, []);

    const fetchSandwich = useCallback(async (sandwichId) => {
        const sandwichData = await readSandwichById(sandwichId);
        debug && console.log("Sandwich:", sandwichData);
        setSandwich(sandwichData);
    }, []);

    const clearSandwich = () => {
        setSandwich({});
        setCurrentIngredientType("bread");
    };

    const saveSandwich = async () => {
        await addSandwichToCurrentUser({ ...sandwich, name: sandwichName });
        clearSandwich();
    };

    return {
        isDataLoading,
        ingredients,
        ingredientTypes,
        currentIngredientType,
        setCurrentIngredientType,
        sandwich,
        setSandwich,
        clearSandwich,
        sandwichName,
        setSandwichName,
        saveSandwich,
        userSandwiches,
        setUserSandwiches,
        fetchUserSandwiches,
        fetchLatestSandwiches,
        fetchSandwich,
    };
};

export default useSandwich;
