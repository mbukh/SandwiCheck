import { debug } from "../constants/debug";

import { Loading, Navbar } from "../components/";

import { useEffect } from "react";

import { Outlet } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

const Layout = () => {
    const navigate = useNavigate();
    const { user, loadingUser } = useUserAuth();

    useEffect(() => {
        if (!loadingUser) navigate("/");
    }, [loadingUser, navigate]);

    debug &&
        console.log("Page in private. Can be here?", !!user?.uid, user?.uid);

    return user?.uid ? (
        <>
            <Navbar />
            <Outlet />
        </>
    ) : (
        <Loading />
    );
};

export default Layout;
