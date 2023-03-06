import { debug } from "../constants/debug";

import { db } from "../constants/firebase.config";

import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

const readUserById = async (userId) => {
    debug && console.log("Reading user by id:", userId);
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    let userData;

    if (docSnap.exists()) {
        userData = docSnap.data();
        debug && console.log("User data retrieved:", userData);
    } else {
        debug && console.log("No such user!");
    }
    return { ...userData, id: userId };
};

const createUser = async (userId, userData) => {
    debug && console.log("Creating a new user");
    try {
        await setDoc(doc(db, "users", userId), userData);
        console.log("User created with ID: ", userId);
    } catch (e) {
        console.error("Error adding user: ", e);
    }
};

const updateUserById = async (userId, userData) => {
    debug && console.log("Updating a user", userId);
    const docRef = doc(db, "users", userId);
    try {
        if (userData.hasOwnProperty("sandwiches"))
            await updateDoc(docRef, {
                ...userData,
                sandwiches: arrayUnion(userData.sandwiches),
            });
        else await updateDoc(docRef, userData);
        console.log("User updated with ID: ", userId);
    } catch (e) {
        console.error("Error updating user: ", e);
    }
};

export { readUserById, createUser, updateUserById };

// export const getChildrenOfCurrentUser = async (userId) => {
//     const starCountRef = ref(db, `users/${userId}/children/`);
//     onValue(starCountRef, (snapshot) => {
//         const data = snapshot.val();
//         return data;
//     });
// };

// export const getUserChildren = async (userId) => {
//     try {
//         // Get user data
//         const userSnapshot = await database
//             .ref(`users/${userId}`)
//             .once("value");
//         const userData = userSnapshot.val();

//         // Get children data
//         const childrenPromises = userData.children.map(async (childId) => {
//             const childSnapshot = await database
//                 .ref(`users/${childId}`)
//                 .once("value");
//             return childSnapshot.val();
//         });
//         const childrenData = await Promise.all(childrenPromises);

//         // Return user and children data
//         return {
//             user: userData,
//             children: childrenData,
//         };
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// };
