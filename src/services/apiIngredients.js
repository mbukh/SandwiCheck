import { debug } from "../constants/";

import { db } from "../constants/firebase.config";

import { collection, getDocs, query, orderBy } from "firebase/firestore";

import { ingredientTypes, cacheTimeoutInMinutes } from "../constants/";

import { timeDifference } from "../utils";

const readAllIngredientsFromCache = () => {
    const cachedIngredients = JSON.parse(localStorage.getItem("ingredients"));
    if (!cachedIngredients) return null;
    const cacheExpired =
        timeDifference(cachedIngredients.cachedAt, Date.now()).minutes >
        cacheTimeoutInMinutes;
    if (cacheExpired) return null;
    debug && console.log("Cache timeout is set to", cacheTimeoutInMinutes, "minutes.");
    return cachedIngredients;
};

const readAllIngredients = async () => {
    const cachedIngredients = readAllIngredientsFromCache();
    if (cachedIngredients) {
        debug && console.log("All ingredients retrieved from cache:", cachedIngredients);
        return cachedIngredients;
    }

    try {
        const resultArray = await Promise.all(
            ingredientTypes.map((ingredientType) =>
                readIngredientCollection(ingredientType)
            )
        );
        const resultObject = resultArray.reduce(
            (a, v, i) => ({ ...a, [ingredientTypes[i]]: v }),
            {}
        );
        localStorage.setItem(
            "ingredients",
            JSON.stringify({ ...resultObject, cachedAt: Date.now() })
        );
        debug && console.log("All ingredients retrieved:", resultObject);
        return resultObject;
    } catch (error) {
        debug && console.error("Error retrieving all ingredients:", error);
        return null;
    }
};

const readIngredientCollection = async (collectionName) => {
    try {
        const collectionRef = collection(db, collectionName);
        const docsSnap = await getDocs(query(collectionRef, orderBy("name")));
        if (docsSnap.docs.length > 0) {
            debug && console.log("Ingredients retrieved for:", collectionName);
            return docsSnap.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
        }
    } catch (error) {
        debug &&
            console.error(
                "Error retrieving ingredients for " + collectionName + ":",
                error
            );
        return null;
    }
};

export { readAllIngredients };
