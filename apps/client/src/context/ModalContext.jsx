import { createContext, useContext, useRef, useCallback, useMemo } from 'react';

const ModalContext = createContext();

const ModalProvider = ({ children }) => {
  const activeModalReference = useRef(null);
  const closeCallbacksReference = useRef(new Map());

  const registerModal = useCallback((modalId, closeCallback) => {
    // Close the previous modal if it's different from the current one
    if (activeModalReference.current && activeModalReference.current !== modalId) {
      const previousCloseCallback = closeCallbacksReference.current.get(activeModalReference.current);
      if (previousCloseCallback) {
        // Pass true to indicate this is a programmatic close (don't navigate)
        previousCloseCallback(null, true);
      }
    }

    // Register the new modal
    activeModalReference.current = modalId;
    closeCallbacksReference.current.set(modalId, closeCallback);
  }, []);

  const unregisterModal = useCallback((modalId) => {
    closeCallbacksReference.current.delete(modalId);

    // If this was the active modal, clear the active modal
    if (activeModalReference.current === modalId) {
      activeModalReference.current = null;
    }
  }, []);

  const closeActiveModal = useCallback(() => {
    const activeModalId = activeModalReference.current;
    if (activeModalId) {
      const closeCallback = closeCallbacksReference.current.get(activeModalId);
      if (closeCallback) {
        // Pass true to indicate this is a programmatic close (don't navigate)
        closeCallback(null, true);
        return true;
      }
    }
    return false;
  }, []);

  const getActiveModal = useCallback(() => activeModalReference.current, []);

  const contextValue = useMemo(
    () => ({
      registerModal,
      unregisterModal,
      getActiveModal,
      closeActiveModal,
    }),
    [registerModal, unregisterModal, getActiveModal, closeActiveModal],
  );

  return <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>;
};

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

export { ModalProvider, useModalContext };
export default ModalContext;
