import { useState, useCallback } from "react";

import { Portal } from "../components";

import Toast from "../components/Toast/Toast";

const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message) => {
        const key = Date.now();
        setToasts((prevToasts) => [...prevToasts, { key, message }]);
    }, []);

    const hideToast = useCallback((key) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.key !== key));
    }, []);

    const toastComponents = (
        <Portal className="toast-portal">
            {toasts.map((toast) => (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    onHide={() => hideToast(toast.key)}
                />
            ))}
        </Portal>
    );

    return { showToast, toastComponents };
};

export default useToast;
