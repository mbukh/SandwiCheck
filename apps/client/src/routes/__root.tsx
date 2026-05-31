import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import Error404 from '@/pages/Error404';

const RootComponent = (): React.JSX.Element => {
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
  notFoundComponent: Error404,
});
