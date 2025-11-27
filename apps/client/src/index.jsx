import './styles/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import AuthGlobalContextProvider from './context/AuthGlobalContext';
import IngredientsGlobalContextProvider from './context/IngredientsGlobalContext';
import { ModalProvider } from './context/ModalContext';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

const App = () => {
  return <RouterProvider router={router} />;
};

const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(
  <React.StrictMode>
    <ModalProvider>
      <AuthGlobalContextProvider>
        <IngredientsGlobalContextProvider>
          <App />
        </IngredientsGlobalContextProvider>
      </AuthGlobalContextProvider>
    </ModalProvider>
  </React.StrictMode>,
);
