import { createRouter, RouterProvider } from '@tanstack/react-router';
import AuthGlobalContextProvider from './context/AuthGlobalContext';
import IngredientsGlobalContextProvider from './context/IngredientsGlobalContext';
import { ModalProvider } from './context/ModalContext';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

const App = (): React.JSX.Element => {
  return (
    <ModalProvider>
      <AuthGlobalContextProvider>
        <IngredientsGlobalContextProvider>
          <RouterProvider router={router} />
        </IngredientsGlobalContextProvider>
      </AuthGlobalContextProvider>
    </ModalProvider>
  );
};

export default App;
