import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Loading, Portal } from "..";

const Modal = ({ children, isModalLoading = true, closeLink = "" }) => {
    const [isModalShow, setIsModalShow] = useState(true);
    const navigate = useNavigate();

    const closeModalHandler = (e) => {
        e.stopPropagation();
        closeLink ? navigate(closeLink) : navigate(-1);
        setIsModalShow(false);
    };

    return (
        isModalShow && (
            <Portal>
                <div
                    className="tingle-modal tingle-modal--noOverlayClose tingle-modal--visible tingle-modal--overflow"
                    onClick={closeModalHandler}
                >
                    <button
                        type="button"
                        className="tingle-modal__close -mx-2"
                        onClick={closeModalHandler}
                    >
                        <span className="tingle-modal__closeIcon">
                            <i className="icon icon-close"></i>
                        </span>
                        <span className="tingle-modal__closeLabel">Close</span>
                    </button>

                    {isModalLoading ? (
                        <div
                            className="flex flex-col flex-1 justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Loading />
                        </div>
                    ) : (
                        <div
                            className="tingle-modal-box w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="tingle-modal-box__content">{children}</div>
                        </div>
                    )}
                </div>
            </Portal>
        )
    );
};

export default Modal;
