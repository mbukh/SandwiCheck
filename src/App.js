import "normalize.css";
import "reset-css";
import "./styles/App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Landing, UserHome, Login, Signup, Layout, Error404, Cart } from "./pages";

import { SandwichEditor } from "./components/";

import { initialize } from "./constants/debug";
// ***** Initialize DB ***** //
import initDB from "./services/initDB";
import { SandwichGallery } from "./components";
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
