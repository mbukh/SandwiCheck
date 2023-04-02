const HamburgerMenu = ({ mobileMenuToggler, isMobileMenuOpen }) => {
    return (
        <button
            className={`hamburger btn-wrapper ${
                isMobileMenuOpen ? "on" : "off"
            } className="mobile-only relative lg:hidden w-10 h-8 focus:outline-none on-top"`}
            onClick={mobileMenuToggler}
        >
            <div></div>
            <div></div>
            <div></div>
        </button>
    );
};

export default HamburgerMenu;
