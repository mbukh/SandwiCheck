import React from "react";

import useSandwich from "../../hooks/use-sandwich";

import { SandwichCard } from "..";

import { Portal } from "..";

const Modal = ({ children }) => {
    return (
        <Portal>
            <div
                className="tingle-modal tingle-modal--noOverlayClose tingle-modal--visible tingle-modal--overflow"
            >
                <button className="btn-wrapper">
                    <span className="icon icon-close" title="Close">
                        <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M.3 9.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3L5 6.4l3.3 3.3c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L6.4 5l3.3-3.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L5 3.6 1.7.3C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L3.6 5 .3 8.3c-.4.4-.4 1 0 1.4z"
                                fill="#000"
                                fill-rule="nonzero"
                            ></path>
                        </svg>
                    </span>
                </button>
                <div className="tingle-modal-box w-full">
                    <div className="tingle-modal-box__content">{children}</div>
                </div>
            </div>
        </Portal>
    );
};

export default Modal;
