import React from 'react';
import { Link } from '@tanstack/react-router';
import github from '../../assets/images/icons/github.svg';

const Footer = () => {
  return (
    <footer className="footer fixed bottom-0 z-10 w-full bg-cyan2-500 text-white">
      <div className="flex h-full items-center px-5 md:px-12 xl:px-20">
        <nav className="footer__nav">
          <ul className="text-shadow-3 flex text-center text-xxs uppercase md:text-xs">
            <li className="mr-4 md:mr-8">
              <Link className="hover:opacity-80" to="https://mbukh.dev" target="_blank">
                MBUKH.dev
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer__triangle pointer-events-none absolute right-0 bottom-0">
        <Link className="pointer-events-auto" to="https://github.com/mbukh/SandwiCheck" target="_blank">
          <img
            className="footer__logo absolute right-0 bottom-0 mr-5 mb-4 block md:mr-12 md:mb-5 md:w-16 xl:mr-20"
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
