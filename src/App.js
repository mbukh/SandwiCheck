import "reset-css";
import "normalize.css";
import "./styles/App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home, Login, Signup, Layout } from "./pages";

import SandwichEditor from "./pages/SandwichEditor";

import { initialize } from "./constants/debug";
// ***** Initialize DB ***** //
import initDB from "./services/initDB";
initialize && (async () => await initDB())();
// ****** *********** ***** //

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/home",
                element: <Home />,
            },
            {
                path: "/home/editor",
                element: <SandwichEditor />,
            },
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
