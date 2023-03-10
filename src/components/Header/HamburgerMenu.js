const HamburgerMenu = ({ className, mobileMenuToggler, isMobileMenuOpen }) => {
    return (
        <button
            className={`hamburger btn-wrapper ${
                isMobileMenuOpen ? "on" : "off"
            } ${className}`}
            onClick={mobileMenuToggler}
        >
            <div></div>
            <div></div>
            <div></div>
        </button>
    );
};

export default HamburgerMenu;
