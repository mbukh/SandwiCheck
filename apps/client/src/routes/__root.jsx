import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';

const RootComponent = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <div id="modal-root"></div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});

export const RootRoute = Route;

