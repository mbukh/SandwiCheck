import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import AuthGlobalContextProvider from "./context/AuthContext";
import IngredientsGlobalContextProvider from "./context/IngredientsContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    // <React.StrictMode>

    <IngredientsGlobalContextProvider>
        <AuthGlobalContextProvider>
            <App />
        </AuthGlobalContextProvider>
    </IngredientsGlobalContextProvider>

    // </React.StrictMode>
);
