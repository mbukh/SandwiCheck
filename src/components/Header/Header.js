import { useEffect, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import HamburgerMenu from "./HamburgerMenu";

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const mobileMenuToggler = () => {
        setIsMobileMenuOpen((state) => !state);
    };

    return (
        <header>
            <div
                className={`mobile-menu fullscreen on-top fl fl-cc fade ${
                    isMobileMenuOpen ? "open" : "close"
                }`}
            >
                <nav
                    className="navbar fl fl-col fl-cc uppercase bold text-xl"
                    onClick={mobileMenuToggler}
                >
                    <NavLink to="/menu">My Menu</NavLink>
                    <NavLink to="/createSandwich">Build a sandwich</NavLink>
                    <NavLink to="/family">My family</NavLink>
                    <NavLink to="/logout">Log out</NavLink>
                </nav>
            </div>

            <div className="navbar">
                <nav className="nav-container fl fl-aic fl-spb">
                    <div className="nav-start fl fl-start rel">
                        <HamburgerMenu
                            className="mobile-only abs abs-v-c on-top"
                            mobileMenuToggler={mobileMenuToggler}
                            isMobileMenuOpen={isMobileMenuOpen}
                        />

                        <div className="desktop-only">
                            <NavLink to="/menu">My menu</NavLink>
                            <NavLink to="/createSandwich">Build a sandwich</NavLink>
                        </div>
                    </div>

                    <div className="nav-center fl fl-cc">
                        <Link to="/latest" className="no-hover block size-full">
                            <div className="logo m-i-a">
                                <div className="fl fl-cc text-s text-sh-5">
                                    Let us
                                    <br /> inspire
                                    <br /> you
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="nav-end fl fl-end mobile-only"></div>

                    <div className="nav-end fl fl-end desktop-only">
                        <NavLink to="/family">My Family</NavLink>
                        <NavLink to="/logout">Log out</NavLink>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
