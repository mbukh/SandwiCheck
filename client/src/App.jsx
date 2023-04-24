import "normalize.css";
import "reset-css";
import "./styles/App.css";
import "./styles/blueprint.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Family from "./pages/Family";
import Layout from "./pages/Layout";
import Error404 from "./pages/Error404";
import Cart from "./pages/Cart";

import SandwichEditor from "./components/Sandwich/Builder/SandwichEditor";
import SandwichModal from "./components/Sandwich/SandwichModal";
import SandwichGallery from "./components/Sandwich/SandwichGallery";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";

const router = createBrowserRouter([
    {
        path: "/sandwich/:sandwichId",
        element: <SandwichModal closeLink="/latest" />,
    },
    {
        path: "/login",
        element: <LoginModal />,
        children: [
            {
                path: "parent/:parentId",
                element: <LoginModal />,
            },
        ],
    },
    {
        path: "/signup",
        element: <SignupModal />,
        children: [
            {
                path: "parent/:parentId",
                element: <SignupModal />,
            },
        ],
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <SandwichGallery galleryType="latest" />, // <SandwichGallery galleryType="best" />
            },
            {
                path: "/latest",
                element: <SandwichGallery galleryType="latest" />,
            },
            {
                path: "/latest/:sandwichId",
                element: (
                    <SandwichGallery galleryType="latest">
                        <SandwichModal />
                    </SandwichGallery>
                ),
            },
            {
                path: "/create",
                element: <SandwichEditor />,
            },
            {
                path: "/menu",
                element: <SandwichGallery galleryType="personal" />,
            },
            {
                path: "/menu/sandwich/:sandwichId",
                element: <SandwichModal />,
            },
            {
                path: "/family",
                element: <Family />,
            },
            {
                path: "/family/:childId",
                element: <SandwichGallery />,
            },
            {
                path: "/family/:childId/sandwich/:sandwichId",
                element: <SandwichModal />,
            },
            {
                path: "/cart",
                element: <Cart />,
            },
        ],
    },
    {
        path: "*",
        element: <Error404 />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
