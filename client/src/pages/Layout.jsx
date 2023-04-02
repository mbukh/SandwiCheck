import { Footer } from "../components";

import { Header } from "../components";

import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
            <div id="modal-root"></div>
        </>
    );
};

export default Layout;
