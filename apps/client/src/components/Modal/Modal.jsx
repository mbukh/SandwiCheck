import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useRouter, useLocation } from '@tanstack/react-router';

import { useModalContext } from '../../context/ModalContext';
import { isAuthRoute } from '../../utils/auth-utils';
import { ROUTE_PATHS } from '../../routes';
import Portal from '../Portal/Portal';
import Loading from '../Loading';

const Modal = ({ children, setIsOpenLoginModal, isModalLoading = true, closeLink = '', modalId }) => {
  const [isModalShow, setIsModalShow] = useState(true);
  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  const { registerModal, unregisterModal } = useModalContext();

  const closeModalHandler = useCallback(
    (e, programmaticClose = false) => {
      e?.stopPropagation();
      // Only navigate if this is a user-initiated close, not a programmatic close by context
      if (!programmaticClose && closeLink !== 'stay') {
        if (closeLink) {
          // Use replace: true to clean up query params when closing modal
          navigate({ to: closeLink, replace: true });
        } else {
          /*
           * If we're on an auth route, navigate to a safe public route instead of going back
           * This prevents redirect loops when closing login modal after being redirected from protected routes
           */
          if (isAuthRoute(location.pathname)) {
            navigate({ to: ROUTE_PATHS.LATEST, replace: true });
          } else if (globalThis.history.length > 1) {
            // Check if there's browser history to go back to
            router.history.back();
          } else {
            // No history, navigate to root page
            navigate({ to: '/', replace: true });
          }
        }
      }
      setIsModalShow(false);
      setIsOpenLoginModal && setIsOpenLoginModal(false);
    },
    [closeLink, navigate, router, location, setIsOpenLoginModal],
  );

  useEffect(() => {
    if (modalId) {
      /*
       * Register this modal with the context
       * The close callback closes this modal the same way as clicking close button
       */
      registerModal(modalId, closeModalHandler);

      return () => {
        // Unregister when component unmounts
        unregisterModal(modalId);
      };
    }
  }, [modalId, registerModal, unregisterModal, closeModalHandler]);

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
