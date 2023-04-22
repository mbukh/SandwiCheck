import { useState } from "react";

import * as apiAuth from "../services/api-auth";

import { logResponse } from "../utils/log";

const useUser = () => {
    const [currentUser, setCurrentUser] = useState({});
    const [isCurrentUserReady, setIsCurrentUserReady] = useState(false);

    const logIn = async ({ email, password, parentId }) => {
        setIsCurrentUserReady(false);

        const res = await apiAuth.login({ email, password, parentId });
        logResponse("🚪 Logging in", res);
        if (!res.success) {
            return res;
        } else {
            setCurrentUser(res.data);
            localStorage.setItem("loggedIn", JSON.stringify(Date.now()));
        }
        setIsCurrentUserReady(true);
    };

    const signUp = async ({ email, password, name, role, parentId }) => {
        setIsCurrentUserReady(false);

        const res = await apiAuth.signup({ email, password, name, role, parentId });
        logResponse("🎊 Signing up", res);
        if (res.error) {
            return res;
        } else {
            setCurrentUser(res.data);
            localStorage.setItem("loggedIn", JSON.stringify(Date.now()));
        }
        setIsCurrentUserReady(true);
    };

    const logOut = async () => {
        setIsCurrentUserReady(false);

        const res = await apiAuth.logout();
        logResponse("🔓 Logout", res);

        setCurrentUser({});
        localStorage.removeItem("loggedIn");
        setIsCurrentUserReady(true);

        return res;
    };

    return {
        currentUser,
        setCurrentUser,
        isCurrentUserReady,
        setIsCurrentUserReady,
        logIn,
        signUp,
        logOut,
    };
};

export default useUser;
