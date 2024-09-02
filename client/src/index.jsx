import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import AuthGlobalContextProvider from './context/AuthGlobalContext';
import IngredientsGlobalContextProvider from './context/IngredientsGlobalContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>

  <AuthGlobalContextProvider>
    <IngredientsGlobalContextProvider>
      <App />
    </IngredientsGlobalContextProvider>
  </AuthGlobalContextProvider>,

  // </React.StrictMode>
);
