import { debug } from "../constants/debug";

import { db } from "../constants/firebase.config";

import { collection, getDocs, query, orderBy } from "firebase/firestore";

const readIngredientsCollection = async (collectionName) => {
    try {
        const collectionRef = collection(db, collectionName);
        const docsSnap = await getDocs(query(collectionRef, orderBy("name"))); 
        if (docsSnap.docs.length > 0) {
            debug && console.log("All ingredients retrieved.");
            return docsSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        }
    } catch (error) {
        debug && console.log("Error retrieving ingredients:", error);
    }
};

const readMealById = (id) => {};

export { readIngredientsCollection, readMealById };
