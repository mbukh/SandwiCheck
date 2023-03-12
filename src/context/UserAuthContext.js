import { debug } from "../constants/";

import { createContext, useContext, useEffect, useState } from "react";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

import { auth } from "../constants/firebase.config";

import { readUserById } from "../services/apiUsers";

const readUserInfo = async (currentUser) => {
    const data = await readUserById(currentUser.uid);
    const children = !data.children?.length
        ? null
        : await Promise.all(data.children.map((childId) => readUserById(childId)));
    return { ...data, children: children };
};

const useAuthContext = () => {
    const [user, setUser] = useState({ uid: null, info: {} });
    const [loadingUser, setLoadingUser] = useState(-1);

    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    function signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }
    function logOut() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            debug && console.log("User authorized", currentUser);

            if (currentUser)
                (async () => {
                    setLoadingUser(1);
                    const userInfo = await readUserInfo(currentUser);
                    setUser({ ...currentUser, info: { ...userInfo } });
                    setLoadingUser(2);
                })();
            else {
                setUser({ uid: null, info: {} });
                setLoadingUser(0);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { user, logIn, signUp, logOut, loadingUser };
};

export default useAuthContext;
