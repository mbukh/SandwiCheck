import { useState, useCallback, useEffect, useRef } from "react";

import { debug } from "../constants";

import { ingredientTypes } from "../constants";

import {
    readSandwichById,
    addSandwichToCurrentUser,
    readLatestSandwiches,
    readBestSandwiches,
    readSandwichesOfCurrentUser,
    readSandwichesOfUserById,
    updateSandwichVotesCount,
    readSandwichFromLocalStorage,
    updateSandwichToLocalStorage,
    deleteSandwichFromLocalStorage,
} from "../services/apiSandwiches";

import {
    didUserVotedForSandwichByIdUsingLocalStorage,
    updateCurrentUserFavoriteSandwiches,
} from "../services/apiUsers";

const useSandwich = () => {
    const [currentIngredientType, setCurrentIngredientType] = useState("bread");
    const [isSavingSandwich, setIsSavingSandwich] = useState(false);
    const [sandwich, setSandwich] = useState({});
    const [gallerySandwiches, setGallerySandwiches] = useState(null);
    const timeout = useRef(null);

    useEffect(() => {
        const cachedUnexpiredSandwich = readSandwichFromLocalStorage();
        debug && console.log("Sandwich retrieved from cache:", cachedUnexpiredSandwich);
        setSandwich(cachedUnexpiredSandwich || {});
    }, [isSavingSandwich]);

    useEffect(() => {
        if (!isSavingSandwich) return;
        updateSandwichToLocalStorage(sandwich);
    }, [isSavingSandwich, sandwich]);

    const updateLocalSandwich = (sandwich) => {
        updateSandwichToLocalStorage(sandwich);
    };

    const fetchUserSandwiches = useCallback(async (id = null) => {
        const sandwichesData = id
            ? await readSandwichesOfUserById(id)
            : await readSandwichesOfCurrentUser();
        debug && console.log("User sandwiches:", sandwichesData);
        setGallerySandwiches(sandwichesData);
    }, []);

    const fetchLatestSandwiches = useCallback(async (count = 30) => {
        const sandwichesData = await readLatestSandwiches(count);
        debug && console.log("Latest sandwiches:", sandwichesData);
        setGallerySandwiches(sandwichesData);
    }, []);
    const fetchBestSandwiches = useCallback(async (count = 30) => {
        const sandwichesData = await readBestSandwiches(count);
        debug && console.log("Best sandwiches:", sandwichesData);
        setGallerySandwiches(sandwichesData);
    }, []);

    const addLikeToSandwich = async (sandwichId) => {
        await updateSandwichVotesCount(sandwichId);
    };

    const hasUserVotedUserForSandwich = useCallback((sandwich, user) => {
        if (!user.id) return didUserVotedForSandwichByIdUsingLocalStorage(sandwich.id);
        return user?.favoriteSandwiches?.includes(sandwich.id);
    }, []);

    const voteForSandwich = useCallback(async (sandwichId) => {
        await updateCurrentUserFavoriteSandwiches(sandwichId);
        await updateSandwichVotesCount(sandwichId);
    }, []);

    const fetchSandwich = useCallback(async (sandwichId) => {
        const sandwichData = await readSandwichById(sandwichId);
        setSandwich(sandwichData);
        debug && console.log("Sandwich:", sandwichData);
    }, []);

    const updateSandwich = useCallback(
        async (newSandwichData) => {
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
        },
        [sandwich]
    );

    const clearSandwich = useCallback(() => {
        setSandwich({});
        setCurrentIngredientType("");
        deleteSandwichFromLocalStorage();
        setTimeout(() => {
            setCurrentIngredientType("bread");
        }, 400);
    }, []);

    const saveSandwich = useCallback(async () => {
        setIsSavingSandwich(true);
        debug && console.log("Adding a sandwich to current user.");
        const newSandwichId = await addSandwichToCurrentUser(sandwich);
        if (!newSandwichId) return null;
        clearSandwich();
        setIsSavingSandwich(false);
        return newSandwichId;
    }, [clearSandwich, sandwich]);

    return {
        ingredientTypes,
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
        fetchUserSandwiches,
        fetchLatestSandwiches,
        fetchBestSandwiches,
        fetchSandwich,
        addLikeToSandwich,
        hasUserVotedUserForSandwich,
        voteForSandwich,
        updateLocalSandwich,
    };
};

export default useSandwich;
