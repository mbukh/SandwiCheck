import "normalize.css";
import "reset-css";
import "./styles/App.css";
import "./styles/blueprint.css";

import initDB from "./services/initDB";
import { initialize } from "./constants/debug";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Landing, UserHome, Layout, Error404, Cart } from "./pages";

import {
    SandwichEditor,
    SandwichModal,
    SandwichGallery,
    LoginModal,
    SignupModal,
} from "./components/";

// ***** Reset DB ***** //
initialize && (async () => await initDB())();
// ****** *********** ***** //

const router = createBrowserRouter([
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
        path: "/sandwich/:sandwichId",
        element: <SandwichModal closeLink="/latest" />,
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <Landing />,
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
                path: "/home",
                element: <UserHome />,
            },
            {
                path: "/createSandwich",
                element: <SandwichEditor />,
            },
            {
                path: "/child/:childId",
                element: <SandwichGallery />,
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
