import { useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';

import Portal from '../Portal/Portal';
import Loading from '../Loading';

const Modal = ({ children, setIsOpenLoginModal, isModalLoading = true, closeLink = '' }) => {
  const [isModalShow, setIsModalShow] = useState(true);
  const navigate = useNavigate();
  const router = useRouter();

  const closeModalHandler = (e) => {
    e.stopPropagation();
    if (closeLink !== 'stay') {
      if (closeLink) {
        // Use replace: true to clean up query params when closing modal
        navigate({ to: closeLink, replace: true });
      } else {
        router.history.back();
      }
    }
    setIsModalShow(false);
    setIsOpenLoginModal && setIsOpenLoginModal(false);
  };

  return (
    isModalShow && (
      <Portal>
        <div
          className="tingle-modal tingle-modal--noOverlayClose tingle-modal--visible tingle-modal--overflow"
          onClick={closeModalHandler}
        >
          <button type="button" className="tingle-modal__close -mx-2" onClick={closeModalHandler}>
            <span className="tingle-modal__closeIcon">
              <i className="icon icon-close"></i>
            </span>
            <span className="tingle-modal__closeLabel">Close</span>
          </button>

          {isModalLoading ? (
            <div className="flex flex-col flex-1 justify-center" onClick={(e) => e.stopPropagation()}>
              <Loading />
            </div>
          ) : (
            <div className="tingle-modal-box w-full" onClick={(e) => e.stopPropagation()}>
              <div className="tingle-modal-box__content">{children}</div>
            </div>
          )}
        </div>
      </Portal>
    )
  );
};

export default Modal;
