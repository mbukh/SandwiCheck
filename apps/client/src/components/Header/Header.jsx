import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from '@tanstack/react-router';

import { useAuthGlobalContext } from '../../context/AuthGlobalContext';
import { ROUTE_PATHS } from '../../routes';
import { isAuthRoute } from '../../utils/auth-utils';

import LoginModal from '../Login/LoginModal';
import SignupModal from '../Signup/SignupModal';

import ActingBanner from './ActingBanner';
import HamburgerMenu from './HamburgerMenu';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
  const [isOpenSignupModal, setIsOpenSignupModal] = useState(false);
  const [isSwitchingParent, setIsSwitchingParent] = useState(false);
  const { logOut, currentUser: user, actingAsChild, parentUser, switchToParent } = useAuthGlobalContext();
  const parameters = useParams({ strict: false });
  const location = useLocation();
  const navigate = useNavigate();
  const sandwichId = parameters.sandwichId;

  const isOnAuthRoute = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  useEffect(() => {
    if (isOnAuthRoute) {
      setIsOpenLoginModal(false);
      setIsOpenSignupModal(false);
    }
  }, [isOnAuthRoute]);

  const toggleMobileMenuHandler = () => {
    setIsMobileMenuOpen((state) => !state);
  };

  const authHandler = (e) => {
    e.preventDefault();

    if (e.target.id === 'logout') {
      logOut();
      return;
    }

    // Get current pathname and check if it's an auth route
    const currentPath = location.pathname;
    const isCurrentPathAuth = isAuthRoute(currentPath);

    // Determine returnTo: use current path if not auth route
    const returnTo = isCurrentPathAuth ? null : currentPath;
    const searchParameters = returnTo ? { returnTo } : {};

    if (e.target.id === 'login') {
      navigate({
        to: ROUTE_PATHS.LOGIN,
        search: searchParameters,
      });
    } else if (e.target.id === 'signup') {
      navigate({
        to: ROUTE_PATHS.SIGNUP,
        search: searchParameters,
      });
    }
  };

  const handleSwitchToParent = async () => {
    if (isSwitchingParent) return;
    setIsSwitchingParent(true);
    const res = await switchToParent();
    setIsSwitchingParent(false);
    if (res?.success) {
      navigate({ to: ROUTE_PATHS.FAMILY });
    }
  };

  return (
    <header className={sandwichId ? 'hidden' : ''}>
      <ActingBanner />
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenuHandler={toggleMobileMenuHandler}
        authHandler={authHandler}
        user={user}
        actingAsChild={actingAsChild}
        parentUser={parentUser}
        onSwitchToParent={handleSwitchToParent}
        isSwitchingParent={isSwitchingParent}
      />

      <div className="navbar">
        <nav className="nav-container flex justify-between items-center px-5 md:px-12 xl:px-20">
          <div className="nav-start w-2/5 flex justify-start">
            <HamburgerMenu mobileMenuToggler={toggleMobileMenuHandler} isMobileMenuOpen={isMobileMenuOpen} />

            <div className="desktop-only lg:inline-block xl:text-lg uppercase text-shadow-10">
              <Link to={ROUTE_PATHS.CREATE} className="mr-6 xl:mr-10 font-bold" activeProps={{ className: 'active' }}>
                Build a sandwich
              </Link>
              <Link to={ROUTE_PATHS.LATEST} className="mr-6 xl:mr-10" activeProps={{ className: 'active' }}>
                Gallery
              </Link>
            </div>
          </div>

          <div className="nav-center flex">
            <Link to={ROUTE_PATHS.LATEST} className="no-hover block size-full">
              <div className="logo mx-auto">
                {user?.name ? (
                  <div className="grid place-items-center text-xs sm:text-base text-sh-5">
                    Let us
                    <br /> inspire you,
                    <br />
                    {user.firstName}
                  </div>
                ) : (
                  <div className="grid place-items-center text-xs sm:text-base text-sh-5">
                    Let us
                    <br /> inspire
                    <br /> you
                  </div>
                )}
              </div>
            </Link>
          </div>

          <div className="nav-end w-2/5 flex justify-end">
            <div className="desktop-only lg:inline-block xl:text-lg uppercase text-shadow-10">
              {user.id ? (
                <>
                  <Link to={ROUTE_PATHS.MENU} className="mr-6 font-bold" activeProps={{ className: 'active' }}>
                    My menu
                  </Link>
                  {user.roles.includes('parent') && (
                    <Link to={ROUTE_PATHS.FAMILY} className="ml-6 xl:mx-10" activeProps={{ className: 'active' }}>
                      My Family
                    </Link>
                  )}

                  <Link id="logout" onClick={authHandler} to="/logout" className="ml-6 xl:ml-4">
                    Log out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    id="login"
                    onClick={authHandler}
                    to={ROUTE_PATHS.LOGIN}
                    className="mr-6"
                    activeProps={{ className: 'active' }}
                  >
                    Log in
                    {isOpenLoginModal && !isOnAuthRoute && (
                      <LoginModal setIsOpenLoginModal={setIsOpenLoginModal} closeLink="stay" />
                    )}
                  </Link>
                  <Link
                    id="signup"
                    onClick={authHandler}
                    to={ROUTE_PATHS.SIGNUP}
                    className="font-bold"
                    activeProps={{ className: 'active' }}
                  >
                    Signup
                    {isOpenSignupModal && !isOnAuthRoute && (
                      <SignupModal setIsOpenLoginModal={setIsOpenSignupModal} closeLink="stay" />
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
