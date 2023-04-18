import { createContext, useContext, useEffect, useState } from "react";

import * as apiAuth from "../services/apiAuth";

import * as apiUsers from "../services/apiUsers";

import useUser from "../hooks/use-user";

import { LOGGED_IN_USER_TIME_OUT_DAYS } from "../constants";

import { timeDifference } from "../utils";

import { logResponse } from "../utils/log";

const AuthGlobalContext = createContext();

const AuthGlobalContextProvider = ({ children }) => {
    const { currentUser, setCurrentUser, isCurrentUserReady, setIsCurrentUserReady } =
        useUser();

    const logIn = async (email, password, parentId) => {
        setIsCurrentUserReady(false);

        const res = await apiAuth.login({ email, password, parentId });
        logResponse("🚪 Logging in", res);

        if (!res.data) {
            setCurrentUser({});
            return null;
        }

        setCurrentUser(res.data);

        localStorage.setItem("loggedIn", JSON.stringify(Date.now()));

        setIsCurrentUserReady(true);
    };

    const signUp = async ({ email, password, name, role, parentId }) => {
        setIsCurrentUserReady(false);

        const res = await apiAuth.signup({ email, password, name, role, parentId });
        logResponse("🎊 Signing up", res);

        if (!res.data) {
            setCurrentUser({});
            return null;
        }

        setCurrentUser(res.data);

        localStorage.setItem("loggedIn", JSON.stringify(Date.now()));

        setIsCurrentUserReady(true);
    };

    const logOut = async () => {
        setIsCurrentUserReady(false);

        const res = await apiAuth.logout();
        logResponse("🔓 Logout", res);

        setCurrentUser({});

        localStorage.removeItem("loggedIn");

        setIsCurrentUserReady(true);
    };

    useEffect(() => {
        // Check wether a user logged in and time out cookies not passed
        const lastLoginAt = JSON.parse(localStorage.getItem("loggedIn"));
        const loggedInFor = timeDifference(lastLoginAt, Date.now()).days;
        if (loggedInFor > LOGGED_IN_USER_TIME_OUT_DAYS) {
            localStorage.removeItem("loggedIn");
        }

        // Skip readCurrent user for not logged in user
        if (!JSON.parse(localStorage.getItem("loggedIn"))) {
            setIsCurrentUserReady(true);
            return;
        }

        (async () => {
            const res = await apiUsers.fetchCurrentUser();
            logResponse("👽 Current user info", res);

            setCurrentUser(res.data || {});

            setIsCurrentUserReady(true);
        })();
    }, []);

    return (
        <AuthGlobalContext.Provider
            value={{
                currentUser,
                isCurrentUserReady,
                logIn,
                signUp,
                logOut,
            }}
        >
            {children}
        </AuthGlobalContext.Provider>
    );
};

export const useAuthGlobalContext = () => useContext(AuthGlobalContext);
export default AuthGlobalContextProvider;
