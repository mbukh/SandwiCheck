import { debug } from "../constants/debug";

import { db } from "../constants/firebase.config";

import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const readUserById = async (userId) => {
    debug && console.log("Reading user by id:", userId);
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
        await setDoc(doc(db, "users", userId), userData);
        debug && console.log("User created with ID: ", userId);
        if (userData?.parents) {
            await Promise.all(
                userData.parents.map((parentId) =>
                    updateUserById(parentId, { children: userId })
                )
            );
        }
    } catch (e) {
        console.error("Error adding user: ", e);
    }
};

const updateUserById = async (userId, userData) => {
    debug && console.log("Updating a user", userId);
    const docRef = doc(db, "users", userId);
    try {
        await updateDoc(docRef, {
            ...userData,
            children: arrayUnion(userData.children),
        });
        debug && console.log("User updated with ID: ", userId);
    } catch (e) {
        console.error("Error updating user: ", e);
    }
};

export { readUserById, createUser, updateUserById };
