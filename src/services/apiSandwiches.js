import { debug } from "../constants/debug";

import { db } from "../constants/firebase.config";

import {
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    arrayUnion,
    collection,
    increment,
    serverTimestamp,
} from "firebase/firestore";

import { updateUserById } from "./apiUsers";

import { trimObjectEmptyProperties } from "../utils/";

const collectionName = "sandwiches";

const isDuplicateSandwich = async (sandwich) => {
    try {
        const collectionRef = collection(db, collectionName);
        const queryConstraints = Object.entries(sandwich).map(
            ([ingredientName, ingredientId]) =>
                where(ingredientName, "==", ingredientId)
        );
        // https://stackoverflow.com/questions/48036975/firestore-multiple-conditional-where-clauses
        const docsSnap = await getDocs(
            query(collectionRef, ...queryConstraints)
        );
        if (docsSnap.docs.length > 0) {
            debug && console.log("Duplicate sandwich WAS found");
            return docsSnap.docs[0];
        } else {
            debug && console.log("Duplicate sandwich NOT found.");
            return null;
        }
    } catch (error) {
        debug && console.log("Error checking duplicate sandwich:", error);
    }
};

const createFavoriteSandwich = async (sandwichData, userId) => {
    const sandwich = trimObjectEmptyProperties(sandwichData);
    const sandwichExists = await isDuplicateSandwich(sandwich);

    if (sandwichExists) {
        const userHasThisSandwich = sandwichExists
            .data()
            .users.includes(userId);

        if (userHasThisSandwich) {
            debug && console.log("A similar sandwich already exists.");
            return;
        }

        debug && console.log("Adding user to sandwich users list.");
        const docRef = sandwichExists.ref;
        await updateDoc(docRef, {
            users: arrayUnion(userId),
            userCount: increment(1),
        });
        return;
    }

    debug && console.log("Adding sandwich to favorites.");
    try {
        const colRef = collection(db, collectionName);
        const newDocRef = await addDoc(colRef, {
            ...sandwich,
            users: [userId],
            userCount: 1,
            created: serverTimestamp(),
        });
        updateUserById(userId, { sandwiches: newDocRef.id });
        console.log("Sandwich added to favorites.");
    } catch (e) {
        console.error("Error adding sandwich to favorites:", e);
    }
};

const getSandwichDataByIngredientsIds = async (ingredientsIds) => {
    
}

export { createFavoriteSandwich };
