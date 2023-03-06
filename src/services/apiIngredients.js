import { debug } from "../constants/debug";

import { db } from "../constants/firebase.config";

import { collection, getDocs, query, orderBy } from "firebase/firestore";

import { ingredientTypes } from "../constants/ingredientTypes";

const readIngredientCollection = async (collectionName) => {
    try {
        const collectionRef = collection(db, collectionName);
        const docsSnap = await getDocs(query(collectionRef, orderBy("name")));
        if (docsSnap.docs.length > 0) {
            debug && console.log("Ingredients retrieved for: ", collectionName);
            return docsSnap.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
        }
    } catch (error) {
        debug &&
            console.log(
                "Error retrieving ingredients for " + collectionName + ":",
                error
            );
        return null;
    }
};

const readAllIngredients = async () => {
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
        debug && console.log("All ingredients retrieved.");
        return resultObject;
    } catch (error) {
        debug && console.log("Error retrieving all ingredients:", error);
        return null;
    }
};

export { readAllIngredients };
