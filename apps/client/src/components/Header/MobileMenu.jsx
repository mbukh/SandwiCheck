import { Link } from '@tanstack/react-router';

import { ROUTE_PATHS } from '../../routes';
import ActingBanner from './ActingBanner';

const MobileMenu = ({ isMobileMenuOpen, toggleMobileMenuHandler, authHandler, user }) => {
  return (
    <div
      className={`mobile-menu fixed inset-0 w-full h-full z-9998 flex justify-center fade ${isMobileMenuOpen ? 'open' : 'close'}`}
    >
      <ActingBanner className="absolute top-0 left-0" />
      <nav
        className="navbar flex flex-col justify-center items-center uppercase font-bold text-xl"
        onClick={toggleMobileMenuHandler}
      >
        <Link to={ROUTE_PATHS.CREATE} activeProps={{ className: 'active' }}>
          Build a sandwich
        </Link>
        <Link to={ROUTE_PATHS.LATEST} activeProps={{ className: 'active' }}>
          Gallery
        </Link>
        {user.id ? (
          <>
            <Link to={ROUTE_PATHS.MENU} activeProps={{ className: 'active' }}>
              My menu
            </Link>
            {user.roles.includes('parent') && (
              <Link to={ROUTE_PATHS.FAMILY} activeProps={{ className: 'active' }}>
                My family
              </Link>
            )}
            <Link id="logout" onClick={authHandler} to="/logout">
              Log out
            </Link>
          </>
        ) : (
          <>
            <Link id="login" onClick={authHandler} to={ROUTE_PATHS.LOGIN}>
              Log in
            </Link>
            <Link id="signup" onClick={authHandler} to={ROUTE_PATHS.SIGNUP}>
              Signup
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
