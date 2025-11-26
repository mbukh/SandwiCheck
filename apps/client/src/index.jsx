import './styles/styles.css';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthGlobalContextProvider from './context/AuthGlobalContext';
import IngredientsGlobalContextProvider from './context/IngredientsGlobalContext';
import { ModalProvider } from './context/ModalContext';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(
  <React.StrictMode>
    <ModalProvider>
      <AuthGlobalContextProvider>
        <IngredientsGlobalContextProvider>
          <RouterProvider router={router} />
        </IngredientsGlobalContextProvider>
      </AuthGlobalContextProvider>
    </ModalProvider>
  </React.StrictMode>,
);
