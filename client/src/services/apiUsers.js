import { debug } from "../constants";

import { auth, db } from "../constants/firebase.config";

import {
    arrayUnion,
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";

const readUserById = async (userId) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const userObject = { ...docSnap.data(), id: docSnap.id };
        debug && console.log("User data retrieved:", userObject);
        return userObject;
    } else {
        debug && console.log("No such user!");
        return null;
    }
};

const createUser = async (userId, userData) => {
    debug && console.log("Creating a new user");
    try {
        await setDoc(doc(db, "users", userId), {
            ...userData,
            type: "parent",
            ...(userData?.parents && {
                parents: userData.parents,
                type: "child",
            }),
            createdAt: serverTimestamp(),
        });
        debug && console.log("User created with ID: ", userId);
    } catch (e) {
        debug && console.error("Error adding user: ", e);
    }
};

const updateUserById = async (userId, userData) => {
    debug && console.log("Updating a user", userId);
    const docRef = doc(db, "users", userId);
    try {
        await updateDoc(docRef, {
            ...userData,
            ...(userData?.children && {
                children: arrayUnion(userData.children),
                type: "parent",
            }),
            ...(userData?.parents && {
                parents: arrayUnion(userData.parents),
                type: "child",
            }),
        });
        debug && console.log("User updated with ID: ", userId);
    } catch (e) {
        debug && console.error("Error updating user: ", e);
    }
};

const updateCurrentUserFavoriteSandwichesInLocalStorage = (sandwichId) => {
    const allVotes = JSON.parse(localStorage.getItem("user_votes")) || [];
    allVotes.push(sandwichId);
    localStorage.setItem("user_votes", JSON.stringify([...new Set(allVotes)]));
};

const updateCurrentUserFavoriteSandwiches = async (sandwichId) => {
    const currentUserId = auth.currentUser?.id;
    if (!currentUserId) {
        updateCurrentUserFavoriteSandwichesInLocalStorage(sandwichId);
        debug && console.log("No user logged in. Added locally.");
        return null;
    }
    debug && console.log("Adding a favorite sandwiches for:", auth.currentuser.id);
    const docRef = doc(db, "users", currentUserId);
    try {
        await updateDoc(docRef, {
            favoriteSandwiches: arrayUnion(sandwichId),
        });
        debug &&
            console.log(
                "Favorite sandwiches updated for:",
                currentUserId,
                "sandwich added:",
                sandwichId
            );
    } catch (e) {
        debug && console.error("Error adding favorite sandwiches: ", e);
    }
};

const didUserVotedForSandwichByIdUsingLocalStorage = (sandwichId) => {
    const allVotes = JSON.parse(localStorage.getItem("user_votes"));
    if (allVotes && allVotes.includes(sandwichId)) {
        debug && console.log("User already voted locally");
        return true;
    }
    return false;
};


export {
    readUserById,
    createUser,
    updateUserById,
    didUserVotedForSandwichByIdUsingLocalStorage,
    updateCurrentUserFavoriteSandwiches,
};
