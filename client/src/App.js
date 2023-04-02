import "normalize.css";
import "reset-css";
import "./styles/App.css";
import "./styles/blueprint.css";

import initDB from "./services/initDB";
import getAllDatabaseAsJSON from "./services/Firestore/exportFirestoreToJSON";
import { initialize, exportJSON } from "./constants/debug";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Family, Layout, Error404, Cart, Landing } from "./pages";

import {
    SandwichEditor,
    SandwichModal,
    SandwichGallery,
    LoginModal,
    SignupModal,
} from "./components/";

// ***** Reset DB ***** //
initialize && (async () => await initDB())();
// ***** Export DB to console ***** //
exportJSON && (async () => await getAllDatabaseAsJSON())();
// ****** *********** ***** //

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
