import { useState } from "react";

import { Link, NavLink, useParams } from "react-router-dom";

import { useAuthGlobalContext } from "../../context";

import { LoginModal } from "..";

import { HamburgerMenu, MobileMenu } from ".";

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
    const { logOut, user } = useAuthGlobalContext();
    const { sandwichId } = useParams();

    const toggleMobileMenuHandler = () => {
        setIsMobileMenuOpen((state) => !state);
    };

    const authHandler = (e) => {
        e.preventDefault();
        e.target.id === "logout" && logOut();
        e.target.id === "login" && setIsOpenLoginModal(true);
    };

    return (
        <header className={sandwichId ? "hide" : ""}>
            <MobileMenu
                isMobileMenuOpen={isMobileMenuOpen}
                toggleMobileMenuHandler={toggleMobileMenuHandler}
                authHandler={authHandler}
                user={user}
            />

            <div className="navbar">
                <nav className="nav-container flex justify-between items-center px-5 md:px-12 xl:px-20">
                    <div className="nav-start w-2/5 flex justify-start">
                        <HamburgerMenu
                            mobileMenuToggler={toggleMobileMenuHandler}
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
                                {!user?.name ? (
                                    <div className="fl fl-cc text-xs sm:text-base text-sh-5">
                                        Let us
                                        <br /> inspire
                                        <br /> you
                                    </div>
                                ) : (
                                    <div className="fl fl-cc text-xs sm:text-base text-sh-5">
                                        Let us
                                        <br /> inspire you,
                                        <br />
                                        {user.name.split(" ")[0]}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>

                    <div className="nav-end w-2/5 flex justify-end">
                        <div className="desktop-only lg:inline-block xl:text-lg uppercase text-shadow-10">
                            {user.id ? (
                                <>
                                    <NavLink to="/menu" className="mr-6 font-bold">
                                        My menu
                                    </NavLink>
                                    {user.roles.includes("parent") && (
                                        <NavLink to="/family" className="ml-6 xl:mx-10">
                                            My Family
                                        </NavLink>
                                    )}

                                    <NavLink
                                        id="logout"
                                        onClick={authHandler}
                                        to="/logout"
                                        className="ml-6 xl:ml-4"
                                    >
                                        Log out
                                    </NavLink>
                                </>
                            ) : (
                                <>
                                    <NavLink id="login" onClick={authHandler} to="/login">
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
