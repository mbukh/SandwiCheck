interface HamburgerMenuProps {
  mobileMenuToggler: () => void;
  isMobileMenuOpen: boolean;
}

const HamburgerMenu = ({ mobileMenuToggler, isMobileMenuOpen }: HamburgerMenuProps): React.JSX.Element => {
  const openStatus = isMobileMenuOpen ? 'on' : 'off';
  return (
    <button
      className={`hamburger btn-wrapper ${openStatus} mobile-only relative z-9999 h-8 w-10 focus:outline-none lg:hidden`}
      onClick={mobileMenuToggler}
    >
      <div></div>
      <div></div>
      <div></div>
    </button>
  );
};

export default HamburgerMenu;
