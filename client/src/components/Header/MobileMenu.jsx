import { NavLink } from 'react-router-dom';

const MobileMenu = ({ isMobileMenuOpen, toggleMobileMenuHandler, authHandler, user }) => {
  return (
    <div className={`mobile-menu fullscreen on-top fl fl-cc fade ${isMobileMenuOpen ? 'open' : 'close'}`}>
      <nav className="navbar fl fl-col fl-cc uppercase bold text-xl" onClick={toggleMobileMenuHandler}>
        <NavLink to="/create">Build a sandwich</NavLink>
        <NavLink to="/latest">Gallery</NavLink>
        {user.id ? (
          <>
            <NavLink to="/menu">My menu</NavLink>
            {user.roles.includes('parent') && <NavLink to="/family">My family</NavLink>}
            <NavLink id="logout" onClick={authHandler} to="/logout">
              Log out
            </NavLink>
          </>
        ) : (
          <>
            <NavLink id="login" onClick={authHandler} to="/in">
              Log in
            </NavLink>
            <NavLink id="signup" onClick={authHandler} to="/in">
              Signup
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
