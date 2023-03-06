import { debug } from "../constants/debug";

import { auth, db } from "../constants/firebase.config";

import {
    query,
    getDocs,
    addDoc,
    collection,
    serverTimestamp,
    doc,
    orderBy,
} from "firebase/firestore";

import { trimObjectEmptyProperties } from "../utils/";

const readSandwichesOfUserById = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const colRef = collection(docRef, "sandwiches");
        const q = query(colRef, orderBy("createdAt"));
        const docsSnap = await getDocs(q);
        if (docsSnap.docs.length > 0) {
            const sandwichesData = docsSnap.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            debug && console.log("User sandwiches retrieved:", sandwichesData);
            return sandwichesData;
        } else {
            debug && console.log("No user sandwiches found.");
            return [];
        }
    } catch (error) {
        debug && console.log("Error retrieving user sandwiches:", error);
    }
};

const readSandwichesOfCurrentUser = async () => {
    const currentUserId = auth?.currentUser.uid;
    return await readSandwichesOfUserById(currentUserId);
};

const addSandwichToCurrentUser = async (sandwich) => {
    const currentUserId = auth?.currentUser.uid;
    const sandwichData = trimObjectEmptyProperties(sandwich);
    debug && console.log("Adding a sandwich to current user.");
    try {
        const docRef = doc(db, "users", currentUserId);
        const colRef = collection(docRef, "sandwiches");
        const newDocRef = await addDoc(colRef, {
            ...sandwichData,
            createdAt: serverTimestamp(),
        });
        debug && console.log("Sandwich id added to user:", newDocRef.id);
        return newDocRef.id;
    } catch (e) {
        console.error("Error adding sandwich:", e);
    }
};

export {
    readSandwichesOfUserById,
    readSandwichesOfCurrentUser,
    addSandwichToCurrentUser,
};
