import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import AuthGlobalContextProvider from "./context/AuthContext";
import SandwichGlobalContextProvider from "./context/SandwichContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    // <React.StrictMode>

    <SandwichGlobalContextProvider>
        <AuthGlobalContextProvider>
            <App />
        </AuthGlobalContextProvider>
     </SandwichGlobalContextProvider>

    // </React.StrictMode>
);
