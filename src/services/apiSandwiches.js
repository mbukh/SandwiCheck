import { debug } from "../constants/";

import { auth, db } from "../constants/firebase.config";

import {
    query,
    getDocs,
    addDoc,
    collection,
    serverTimestamp,
    doc,
    orderBy,
    collectionGroup,
    limit,
    where,
    updateDoc,
} from "firebase/firestore";

import { trimObjectEmptyProperties } from "../utils/";

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
    try {
        const colGroupRef = collectionGroup(db, "sandwiches");
        const q = query(colGroupRef, where("id", "==", sandwichId), limit(1));
        const docsSnap = await getDocs(q);
        if (docsSnap.docs.length > 0) {
            const sandwichData = {
                ...docsSnap.docs[0].data(),
                id: docsSnap.docs[0].id,
            };
            debug && console.log("Sandwiches retrieved");
            return sandwichData;
        } else {
            debug && console.log("Sandwich not found.");
            return [];
        }
    } catch (error) {
        debug && console.error("Error reading sandwich:", error);
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
                id: doc.id,
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
    const currentUserId = auth.currentUser.uid;
    return await readSandwichesOfUserById(currentUserId);
};

const addSandwichToCurrentUser = async (sandwich) => {
    const currentUserId = auth.currentUser.uid;
    const sandwichData = trimObjectEmptyProperties(sandwich);
    debug && console.log("Adding a sandwich to current user.");
    try {
        const docRef = doc(db, "users", currentUserId);
        const colRef = collection(docRef, "sandwiches");
        const authorName = await getDocs(docRef).data().name.split(" ")[0];
        const newDocRef = await addDoc(colRef, {
            author: authorName,
            createdAt: serverTimestamp(),
            name: authorName + "'s Sandwich",
            ...sandwichData,
        });
        updateDoc(newDocRef, { id: newDocRef.id });
        debug && console.log("Sandwich id added to user:", newDocRef.id);
        return newDocRef.id;
    } catch (e) {
        debug && console.error("Error adding sandwich:", e);
    }
};

export {
    readSandwichById,
    readLatestSandwiches,
    readSandwichesOfUserById,
    readSandwichesOfCurrentUser,
    addSandwichToCurrentUser,
};
