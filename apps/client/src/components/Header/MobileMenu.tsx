import { Link } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/route-paths';
import type { CurrentUser, User } from '@/types/domain';
import ActingBanner from './ActingBanner';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenuHandler: () => void;
  authHandler: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  user: CurrentUser;
  // Passed by Header but currently unused here (acting-as-child UI lives in ActingBanner).
  actingAsChild?: boolean;
  parentUser?: User | null;
  onSwitchToParent?: () => Promise<void>;
  isSwitchingParent?: boolean;
}

const MobileMenu = ({
  isMobileMenuOpen,
  toggleMobileMenuHandler,
  authHandler,
  user,
}: MobileMenuProps): React.JSX.Element => {
  return (
    <div
      className={`mobile-menu fade fixed inset-0 z-9998 flex h-full w-full justify-center ${isMobileMenuOpen ? 'open' : 'close'}`}
    >
      <ActingBanner className="absolute top-0 left-0" />
      <nav
        className="navbar flex flex-col items-center justify-center text-xl font-bold uppercase"
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
            {user.roles?.includes('parent') && (
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
