import { Outlet } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header/Header";

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
