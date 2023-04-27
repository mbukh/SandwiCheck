import { createContext, useContext, useEffect } from "react";

import * as apiUsers from "../services/api-users";

import useUser from "../hooks//use-user";

import { LOGGED_IN_USER_TIME_OUT_DAYS } from "../constants/user-constants";

import { timeDifference } from "../utils/utils";

import { logResponse } from "../utils/log";

const AuthGlobalContext = createContext();

const AuthGlobalContextProvider = ({ children }) => {
    const {
        currentUser,
        setCurrentUser,
        isCurrentUserReady,
        setIsCurrentUserReady,
        logIn,
        signUp,
        logOut,
    } = useUser();

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
            if (res.success) {
                setCurrentUser(res.data);
            } else {
                setCurrentUser({});
            }

            setIsCurrentUserReady(true);
        })();
    }, [setCurrentUser, setIsCurrentUserReady]);

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
