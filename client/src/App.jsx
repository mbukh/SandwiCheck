import "normalize.css";
import "reset-css";
import "./styles/App.css";
import "./styles/blueprint.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import SandwichContextProvider from "./context/SandwichContext";

import Family from "./pages/Family";
import Layout from "./pages/Layout";
import Error404 from "./pages/Error404";
import Cart from "./pages/Cart";

import SandwichBuilder from "./components/Sandwich/Builder/SandwichBuilder";
import SandwichModal from "./components/Sandwich/SandwichModal";
import SandwichGallery from "./components/Sandwich/SandwichGallery";
import LoginModal from "./components/Login/LoginModal";
import SignupModal from "./components/Signup/SignupModal";

const router = createBrowserRouter(
  [
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
          element: <SandwichGallery galleryType="latest" />,
        },
        {
          path: "/best",
          element: <SandwichGallery galleryType="best" />,
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
          element: (
            <SandwichContextProvider>
              <SandwichBuilder />
            </SandwichContextProvider>
          ),
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
  ],
  { basename: process.env.REACT_APP_PATH }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
