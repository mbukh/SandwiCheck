import { useEffect, useState, useCallback } from "react";

import { debug } from "../constants/debug";

import { ingredientTypes } from "../constants/ingredientTypes";

import { readAllIngredients } from "../services/apiIngredients";
import {
    addSandwichToCurrentUser,
    readLatestSandwiches,
    readSandwichesOfCurrentUser,
    readSandwichesOfUserById,
} from "../services/apiSandwiches";

const useSandwich = () => {
    const [ingredients, setIngredients] = useState({});
    const [currentIngredientType, setCurrentIngredientType] = useState("bread");
    const [sandwich, setSandwich] = useState({});
    const [sandwichName, setSandwichName] = useState("");
    const [userSandwiches, setUserSandwiches] = useState(null);

    useEffect(() => {
        const fetchAllIngredients = async () => {
            const result = await readAllIngredients();
            debug && console.log("All ingredients:", result);
            setIngredients(result);
        };
        fetchAllIngredients();
        return () => clearSandwich();
    }, []);

    const fetchUserSandwiches = useCallback(async (uid = null) => {
        const resultArray = uid
            ? await readSandwichesOfUserById(uid)
            : await readSandwichesOfCurrentUser();
        debug && console.log("User sandwiches:", resultArray);
        setUserSandwiches(resultArray);
    }, []);

    const fetchLatestSandwiches = useCallback(async (count = 30) => {
        const resultArray = await readLatestSandwiches(count);
        debug && console.log("Latest sandwiches:", resultArray);
        setUserSandwiches(resultArray);
    }, []);

    const clearSandwich = () => {
        setSandwich({});
        setCurrentIngredientType("");
    };

    const saveSandwich = async () => {
        await addSandwichToCurrentUser({ ...sandwich, name: sandwichName });
        clearSandwich();
    };

    return {
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
    };
};

export default useSandwich;
