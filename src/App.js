import "normalize.css";
import "reset-css";
import "./styles/App.css";
import "./styles/blueprint.css";

import initDB from "./services/initDB";
import { initialize } from "./constants/debug";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Landing, UserHome, Login, Signup, Layout, Error404, Cart } from "./pages";

import { SandwichEditor, SandwichModal, SandwichGallery } from "./components/";

// ***** Reset DB ***** //
initialize && (async () => await initDB())();
// ****** *********** ***** //

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/login/parent/:parentId",
        element: <Login />,
    },
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/signup/parent/:parentId",
        element: <Signup />,
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
                    <>
                        <SandwichGallery galleryType="latest">
                            <SandwichModal />
                        </SandwichGallery>
                    </>
                ),
            },
            {
                path: "/sandwich/:sandwichId",
                element: <SandwichModal closeLink="/latest" />,
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
