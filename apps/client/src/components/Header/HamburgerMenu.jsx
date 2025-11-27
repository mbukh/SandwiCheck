const HamburgerMenu = ({ mobileMenuToggler, isMobileMenuOpen }) => {
  const openStatus = isMobileMenuOpen ? 'on' : 'off';
  return (
    <button
      className={`hamburger btn-wrapper ${openStatus} className="mobile-only relative z-9999 h-8 w-10 focus:outline-none lg:hidden`}
      onClick={mobileMenuToggler}
    >
      <div></div>
      <div></div>
      <div></div>
    </button>
  );
};

export default HamburgerMenu;
