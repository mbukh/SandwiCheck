import { createContext, useCallback, useContext, useEffect, useState } from "react";

import * as api from "../services/api";

import { debug } from "../constants";

const AuthGlobalContext = createContext();

const AuthGlobalContextProvider = ({ children }) => {
    const [user, setUser] = useState({ id: null, info: {} });
    const [isUserReady, setIsUserReady] = useState(false);

    const logIn = useCallback(async (email, password) => {
        try {
            const { data } = await api.login(email, password);
            setUser({ id: data.user.id, info: data.user });
        } catch (error) {
            debug && console.error("Error logging in:", error);
        }
    }, []);

    const signUp = useCallback(async (email, password, name, role, parentId) => {
        try {
            const { data } = await api.signup(email, password, name, role, parentId);
            setUser({ id: data.user.id, info: data.user });
        } catch (error) {
            debug && console.error("Error signing up:", error);
        }
    }, []);

    const logOut = useCallback(async () => {
        try {
            await api.logout();
            setUser({ id: null, info: {} });
        } catch (error) {
            debug && console.error("Error logging out:", error);
        }
    }, []);

    useEffect(() => {
        (async () => {
            if (user.id) {
                const userInfo = await api.readCurrentUser(user);
                setUser((prevUser) => ({ ...prevUser, info: { ...userInfo } }));
                setIsUserReady(true);
            }
        })();
    }, [user, user.id]);

    return (
        <AuthGlobalContext.Provider value={{ user, isUserReady, logIn, signUp, logOut }}>
            {children}
        </AuthGlobalContext.Provider>
    );
};

export const useAuthGlobalContext = () => useContext(AuthGlobalContext);
export default AuthGlobalContextProvider;
