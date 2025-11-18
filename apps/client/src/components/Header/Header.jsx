import { useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';

import { useAuthGlobalContext } from '../../context/AuthGlobalContext';
import { ROUTE_PATHS } from '../../routes';

import LoginModal from '../Login/LoginModal';
import SignupModal from '../Signup/SignupModal';

import HamburgerMenu from './HamburgerMenu';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
  const [isOpenSignupModal, setIsOpenSignupModal] = useState(false);
  const { logOut, currentUser: user } = useAuthGlobalContext();
  const params = useParams({ strict: false });
  const sandwichId = params.sandwichId;

  const toggleMobileMenuHandler = () => {
    setIsMobileMenuOpen((state) => !state);
  };

  const authHandler = (e) => {
    e.preventDefault();
    e.target.id === 'logout' && logOut();
    e.target.id === 'login' && setIsOpenLoginModal(true);
    e.target.id === 'signup' && setIsOpenSignupModal(true);
  };

  return (
    <header className={sandwichId ? 'hide' : ''}>
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenuHandler={toggleMobileMenuHandler}
        authHandler={authHandler}
        user={user}
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

          <div className="nav-center fl fl-cc">
            <Link to={ROUTE_PATHS.LATEST} className="no-hover block size-full">
              <div className="logo m-i-a">
                {!user?.name ? (
                  <div className="fl fl-cc text-xs sm:text-base text-sh-5">
                    Let us
                    <br /> inspire
                    <br /> you
                  </div>
                ) : (
                  <div className="fl fl-cc text-xs sm:text-base text-sh-5">
                    Let us
                    <br /> inspire you,
                    <br />
                    {user.firstName}
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
                  <Link id="login" onClick={authHandler} to={ROUTE_PATHS.LOGIN} className="mr-6" activeProps={{ className: 'active' }}>
                    Log in
                    {isOpenLoginModal && <LoginModal setIsOpenLoginModal={setIsOpenLoginModal} closeLink="stay" />}
                  </Link>
                  <Link id="signup" onClick={authHandler} to={ROUTE_PATHS.SIGNUP} className="font-bold" activeProps={{ className: 'active' }}>
                    Signup
                    {isOpenSignupModal && <SignupModal setIsOpenLoginModal={setIsOpenSignupModal} closeLink="stay" />}
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
