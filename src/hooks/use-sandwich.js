import { useEffect, useState, useCallback } from "react";

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
    const [sandwich, setSandwich] = useState();
    const [sandwichName, setSandwichName] = useState("");
    const [userSandwiches, setUserSandwiches] = useState(null);

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
        setCurrentIngredientType("");
        setTimeout(() => {
            setCurrentIngredientType("bread");
        }, 400);
    };

    const saveSandwich = async () => {
        await addSandwichToCurrentUser({ ...sandwich, name: sandwichName });
        clearSandwich();
    };

    return {
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
