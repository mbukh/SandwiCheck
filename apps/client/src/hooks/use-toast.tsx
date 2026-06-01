import { type ReactNode, useCallback, useState } from 'react';
import Portal from '@/components/Portal/Portal';
import Toast from '@/components/Toast/Toast';

interface ToastItem {
  key: string;
  message: string;
}

interface UseToastResult {
  showToast: (message: string) => void;
  toastComponents: ReactNode;
}

const useToast = (): UseToastResult => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string) => {
    const key = message + Date.now();
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
