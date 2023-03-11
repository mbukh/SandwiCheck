import { useState } from "react";

import { Link, NavLink, useParams } from "react-router-dom";

import HamburgerMenu from "./HamburgerMenu";

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { sandwichId } = useParams();

    const mobileMenuToggler = () => {
        setIsMobileMenuOpen((state) => !state);
    };

    return (
        <header className={sandwichId ? "hide" : ""}>
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
                <nav className="nav-container flex justify-between items-center px-5 md:px-12 xl:px-20">
                    <div className="nav-start w-2/5 flex justify-start">
                        <HamburgerMenu
                            className="mobile-only relative lg:hidden w-10 h-8 -ml-2 focus:outline-none on-top"
                            mobileMenuToggler={mobileMenuToggler}
                            isMobileMenuOpen={isMobileMenuOpen}
                        />

                        <div className="desktop-only lg:inline-block xl:text-lg uppercase text-shadow-10">
                            <NavLink
                                to="/createSandwich"
                                className="mr-6 xl:mr-10 font-bold"
                            >
                                Build a sandwich
                            </NavLink>
                            <NavLink to="/latest" className="mr-6 xl:mr-10">
                                Gallery
                            </NavLink>
                        </div>
                    </div>

                    <div className="nav-center fl fl-cc">
                        <Link to="/latest" className="no-hover block size-full">
                            <div className="logo m-i-a">
                                <div className="fl fl-cc text-xs sm:text-base text-sh-5">
                                    Let us
                                    <br /> inspire
                                    <br /> you
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="nav-end w-2/5 flex justify-end">
                        <div className="desktop-only lg:inline-block xl:text-lg uppercase text-shadow-10">
                            <NavLink to="/family" className="mr-6 xl:mx-10 font-bold">
                                My menu
                            </NavLink>
                            <NavLink to="/family" className="mr-6 xl:mx-10">
                                My Family
                            </NavLink>
                            <NavLink to="/logout">Log out</NavLink>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
