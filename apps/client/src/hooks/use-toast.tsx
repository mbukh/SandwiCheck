import { type ReactNode, useCallback, useState } from 'react';
import Portal from '@/components/Portal/Portal';
import Toast from '@/components/Toast/Toast';

interface ToastItem {
  key: string;
  message: string;
}

/*
 * Module-scope monotonic counter for toast keys. The old `message + Date.now()` scheme collided
 * when the same message was shown twice in one millisecond (e.g. an error loop), which — now that
 * onHide actually unmounts toasts — caused a React duplicate-key warning and removed both at once.
 */
let toastKeySequence = 0;

interface UseToastResult {
  showToast: (message: string) => void;
  toastComponents: ReactNode;
}

const useToast = (): UseToastResult => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string) => {
    toastKeySequence += 1;
    const key = `toast-${toastKeySequence}`;
    setToasts((previousToasts) => [...previousToasts, { key, message }]);
  }, []);

  const hideToast = useCallback((key: string) => {
    setToasts((previousToasts) => previousToasts.filter((toast) => toast.key !== key));
  }, []);

  const toastComponents = (
    <Portal className="toast-portal">
      {toasts.map((toast) => (
        <Toast key={toast.key} message={toast.message} onHide={() => hideToast(toast.key)} />
      ))}
    </Portal>
  );

  return { showToast, toastComponents };
};

export default useToast;
