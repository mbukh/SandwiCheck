import { debug, cacheTimeoutInMinutes } from "../constants";

import { auth, db } from "../constants/firebase.config";

import {
    query,
    getDocs,
    collection,
    serverTimestamp,
    doc,
    orderBy,
    collectionGroup,
    limit,
    where,
    updateDoc,
    getDoc,
    increment,
    setDoc,
} from "firebase/firestore";

import { trimObjectEmptyProperties, timeDifference } from "../utils";

// const isDuplicateSandwich = async (sandwich) => {
//     try {
//         const collectionRef = collection(db, collectionName);
//         const queryConstraints = Object.entries(sandwich).map(
//             ([ingredientName, ingredientId]) =>
//                 where(ingredientName, "==", ingredientId)
//         );
//         // https://stackoverflow.com/questions/48036975/firestore-multiple-conditional-where-clauses
//         const docsSnap = await getDocs(
//             query(collectionRef, ...queryConstraints)
//         );
//         if (docsSnap.docs.length > 0) {
//             debug && console.log("Duplicate sandwich WAS found");
//             return docsSnap.docs[0];
//         } else {
//             debug && console.log("Duplicate sandwich NOT found.");
//             return null;
//         }
//     } catch (error) {
//         debug && console.log("Error checking duplicate sandwich:", error);
//     }
// };

const readSandwichById = async (sandwichId) => {
    debug && console.log("Reading sandwich:", sandwichId);
    try {
        const colGroupRef = collectionGroup(db, "sandwiches");
        const q = query(colGroupRef, where("id", "==", sandwichId), limit(1));
        const docsSnap = await getDocs(q);
        if (docsSnap.docs.length > 0) {
            const sandwichData = {
                ...docsSnap.docs[0].data(),
                id: docsSnap.docs[0].id,
            };
            debug && console.log("Sandwich retrieved.");
            return sandwichData;
        } else {
            debug && console.log("Sandwich not found.");
            return {};
        }
    } catch (error) {
        debug && console.error("Error reading sandwich:", error);
    }
};

const readBestSandwiches = async (count = 30) => {
    try {
        const colGroupRef = collectionGroup(db, "sandwiches");
        const q = query(colGroupRef, orderBy("votesCount", "desc"), limit(count));
        const docsSnap = await getDocs(q);
        if (docsSnap.docs.length > 0) {
            const sandwichesData = docsSnap.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            debug && console.log("Best sandwiches retrieved.");
            return sandwichesData;
        } else {
            debug && console.log("No best sandwiches found.");
            return [];
        }
    } catch (error) {
        debug && console.error("Error reading best sandwiches:", error);
    }
};

const readLatestSandwiches = async (count = 30) => {
    try {
        const colGroupRef = collectionGroup(db, "sandwiches");
        const q = query(colGroupRef, orderBy("createdAt", "desc"), limit(count));
        const docsSnap = await getDocs(q);
        if (docsSnap.docs.length > 0) {
            const sandwichesData = docsSnap.docs.map((doc) => ({
                ...doc.data(),
                // id: doc.id,
            }));
            debug && console.log("Latest sandwiches retrieved.");
            return sandwichesData;
        } else {
            debug && console.log("No latest sandwiches found.");
            return [];
        }
    } catch (error) {
        debug && console.error("Error reading latest sandwiches:", error);
    }
};

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
            debug && console.log("User sandwiches retrieved.");
            return sandwichesData;
        } else {
            debug && console.log("No user sandwiches found.");
            return [];
        }
    } catch (error) {
        debug && console.error("Error retrieving user sandwiches:", error);
    }
};

const readSandwichesOfCurrentUser = async () => {
    const currentUserId = auth.currentUser?.id;
    if (!currentUserId) {
        debug && console.log("No user logged in.");
        return null;
    }
    return await readSandwichesOfUserById(currentUserId);
};

const addSandwichToCurrentUser = async (sandwich) => {
    const currentUserId = auth.currentUser?.id;
    if (!currentUserId) {
        debug && console.log("No user logged in.");
        return null;
    }
    const sandwichData = trimObjectEmptyProperties(sandwich);
    try {
        const docRef = doc(db, "users", currentUserId);
        const colRef = collection(docRef, "sandwiches");
        const authorSnap = await getDoc(docRef);
        const authorFirstName = authorSnap.data().name.split(" ")[0];
        const newDocRef = doc(colRef);
        const result = await setDoc(newDocRef, {
            ...sandwichData,
            id: newDocRef.id,
            name: sandwich.name || authorFirstName + "'s Sandwich",
            author: authorFirstName,
            createdAt: serverTimestamp(),
        });

        console.log("newDocRef.id");
        console.log(newDocRef.id);
        console.log(newDocRef.id);
        console.log(newDocRef.id);
        console.log("result");
        console.log(result);
        console.log(result);
        console.log(result);

        debug && console.log("Sandwich id added to user:", newDocRef.id);
        return newDocRef.id;
    } catch (e) {
        debug && console.error("Error adding sandwich:", e);
    }
};

const updateSandwichVotesCount = async (sandwichId) => {
    try {
        const colGroupRef = collectionGroup(db, "sandwiches");
        const q = query(colGroupRef, where("id", "==", sandwichId), limit(1));
        const docsSnap = await getDocs(q);
        if (docsSnap.docs.length > 0) {
            await updateDoc(
                docsSnap.docs[0].ref,
                {
                    votesCount: increment(1),
                },
                { merge: true }
            );
            debug && console.log("Sandwich got a like");
        } else {
            debug && console.log("Sandwich id is invalid for a like.");
        }
    } catch (error) {
        debug && console.error("Error adding a like:", error);
    }
};

const readSandwichFromLocalStorage = () => {
    debug && console.log("Reading sandwich from cache.");
    const cachedSandwich = JSON.parse(localStorage.getItem("sandwich"));
    if (!cachedSandwich) return null;
    const cacheExpired =
        timeDifference(cachedSandwich.updatedAt, Date.now()).minutes >
        cacheTimeoutInMinutes;
    if (cacheExpired) return null;
    debug && console.log("Cache timeout is set to", cacheTimeoutInMinutes, "minutes.");
    const { updatedAt, ...sandwich } = cachedSandwich;
    return sandwich;
};

const updateSandwichToLocalStorage = (sandwichData) => {
    debug && console.log("Writing sandwich to cache.");
    return localStorage.setItem(
        "sandwich",
        JSON.stringify({
            ...sandwichData,
            updatedAt: Date.now(),
        })
    );
};

const deleteSandwichFromLocalStorage = () => {
    debug && console.log("Removing sandwich from cache.");
    localStorage.removeItem("sandwich");
};

export {
    readSandwichById,
    readLatestSandwiches,
    readBestSandwiches,
    readSandwichesOfUserById,
    readSandwichesOfCurrentUser,
    addSandwichToCurrentUser,
    updateSandwichVotesCount,
    readSandwichFromLocalStorage,
    updateSandwichToLocalStorage,
    deleteSandwichFromLocalStorage,
};
