import { useState } from "react";

import { Link, NavLink, useParams } from "react-router-dom";

import { useAuthGlobalContext } from "../../context";

import { LoginModal } from "../";

import HamburgerMenu from "./HamburgerMenu";

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
    const { logOut, user } = useAuthGlobalContext();
    const { sandwichId } = useParams();

    const mobileMenuToggler = () => {
        setIsMobileMenuOpen((state) => !state);
    };

    const logOutHandler = (e) => {
        e.preventDefault();
        logOut();
    };

    const loginHandler = (e) => {
        e.preventDefault();
        setIsOpenLoginModal(true);
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
                    <NavLink to="/create">Build a sandwich</NavLink>
                    <NavLink to="/latest">Gallery</NavLink>
                    {user.uid ? (
                        <>
                            <NavLink to="/menu">My menu</NavLink>
                            {user.info?.type === "parent" && (
                                <NavLink to="/family">My family</NavLink>
                            )}
                            <NavLink onClick={logOutHandler} to="/logout">
                                Log out
                            </NavLink>
                        </>
                    ) : (
                        <NavLink onClick={loginHandler} to="/in">
                            Log in
                        </NavLink>
                    )}
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
                            <NavLink to="/create" className="mr-6 xl:mr-10 font-bold">
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
                            {user.uid ? (
                                <>
                                    <NavLink
                                        to="/menu"
                                        className="mr-6 font-bold"
                                    >
                                        My menu
                                    </NavLink>
                                    {user.info?.type === "parent" && (
                                        <NavLink to="/family" className="ml-6 xl:mx-10">
                                            My Family
                                        </NavLink>
                                    )}

                                    <NavLink onClick={logOutHandler} to="/logout" className="xl:ml-4">
                                        Log out
                                    </NavLink>
                                </>
                            ) : (
                                <>
                                    <NavLink onClick={loginHandler} to="/login">
                                        Log in
                                    </NavLink>
                                    {isOpenLoginModal && (
                                        <LoginModal
                                            setIsOpenLoginModal={setIsOpenLoginModal}
                                            closeLink="stay"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
