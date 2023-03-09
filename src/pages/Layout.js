import { Footer } from "../components/";

import { Header } from "../components/";

import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <>
            <Header />
            <Outlet />
            {/* <Footer /> */}
        </>
    );
};

export default Layout;
