const HamburgerMenu = ({ className, mobileMenuToggler, isMobileMenuOpen }) => {
    return (
        <button
            className={`${className} ${isMobileMenuOpen ? "on" : "off"}`}
            onClick={mobileMenuToggler}
        >
            <div></div>
            <div></div>
            <div></div>
        </button>
    );
};

export default HamburgerMenu;
