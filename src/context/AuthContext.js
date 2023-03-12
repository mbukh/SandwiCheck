import { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

import { auth } from "../constants/firebase.config";

import { readUserById } from "../services/apiUsers";

import { debug } from "../constants";

const AuthGlobalContext = createContext();

const AuthGlobalContextProvider = ({ children }) => {
    const [user, setUser] = useState({ uid: null, info: {} });
    const [isUserReady, setIsUserReady] = useState(false);

    const logIn = useCallback(
        (email, password) => signInWithEmailAndPassword(auth, email, password),
        []
    );
    const signUp = useCallback(
        (email, password) => createUserWithEmailAndPassword(auth, email, password),
        []
    );
    const logOut = useCallback(() => signOut(auth), []);

    const readUserInfo = useCallback(async (currentUser) => {
        const userData = await readUserById(currentUser.uid);
        const children = !userData.children?.length
            ? null
            : await Promise.all(
                userData.children.map((childId) => readUserById(childId))
            );
        return { ...userData, children: children };
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            debug && console.log("Current user:", currentUser);
            if (currentUser)
                (async () => {
                    const userInfo = await readUserInfo(currentUser);
                    setUser({ ...currentUser, info: { ...userInfo } });
                    setIsUserReady(true);
                })();
            else {
                setUser({ uid: null, info: {} });
                setIsUserReady(true);
            }
        });

        return () => {
            setIsUserReady(false);
            unsubscribe();
        };
    }, [readUserInfo]);

    return (
        <AuthGlobalContext.Provider value={{ user, isUserReady, logIn, signUp, logOut }}>
            {children}
        </AuthGlobalContext.Provider>
    );
};

export const useAuthGlobalContext = () => useContext(AuthGlobalContext);
export default AuthGlobalContextProvider;
