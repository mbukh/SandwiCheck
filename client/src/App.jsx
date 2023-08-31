import "normalize.css";
import "reset-css";
import "./styles/App.css";
import "./styles/blueprint.css";

import { createHashRouter, RouterProvider } from "react-router-dom";

import SandwichContextProvider from "./context/SandwichContext";

import Cart from "./pages/Cart";
import Error404 from "./pages/Error404";
import Family from "./pages/Family";
import Layout from "./pages/Layout";

import LoginModal from "./components/Login/LoginModal";
import SandwichBuilder from "./components/Sandwich/Builder/SandwichBuilder";
import SandwichGallery from "./components/Sandwich/SandwichGallery";
import SandwichModal from "./components/Sandwich/SandwichModal";
import SignupModal from "./components/Signup/SignupModal";

const router = createHashRouter([
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
