import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import SignupModal from '@/components/Signup/SignupModal';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { useAuthGlobalContext } from '@/context/AuthGlobalContext';
import Error404 from '@/pages/Error404';

const RootComponent = (): React.JSX.Element => {
  const { isSignupPromptOpen, setIsSignupPromptOpen } = useAuthGlobalContext();

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <div id="modal-root"></div>
      {/*
       * App-level signup prompt: a sibling of the route Outlet (not nested in any route
       * modal), so it survives even when opened from inside the sandwich detail modal — the
       * one-active-modal ModalContext closes that modal while this overlay stays mounted.
       * Closing returns to the gallery (avoids a dead-end on the header-less /sandwich route).
       */}
      {isSignupPromptOpen && <SignupModal setIsOpenLoginModal={setIsSignupPromptOpen} closeLink={ROUTE_PATHS.LATEST} />}
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: Error404,
});
