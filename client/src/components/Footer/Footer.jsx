import React from "react";
import { Link } from "react-router-dom";

import github from "../../assets/images/icons/github.svg";

const Footer = () => {
    return (
        <footer className="footer fixed z-10 bottom-0 w-full bg-cyan2 text-white">
            <div className="flex items-center h-full px-5 md:px-12 xl:px-20">
                <nav className="footer__nav">
                    <ul className="flex text-xxs md:text-xs text-center uppercase text-shadow-3">
                        <li className="mr-4 md:mr-8">
                            <Link
                                className="hover:opacity-80"
                                to="https://mbukh.dev"
                                target="_blank"
                            >
                                MBUKH.dev
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            <div className="footer__triangle absolute bottom-0 right-0 pointer-events-none">
                <Link
                    className="pointer-events-auto"
                    to="https://github.com/mbukh/Appleseeds-SandwiCheck"
                    target="_blank"
                >
                    <img
                        className="footer__logo block md:w-16 absolute bottom-0 right-0 mb-4 md:mb-5 mr-5 md:mr-12 xl:mr-20"
                        src={github}
                        alt="Github logo"
                        width="50"
                        height="50"
                    />
                </Link>
            </div>
        </footer>
    );
};

export default Footer;
