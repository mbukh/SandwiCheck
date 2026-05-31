import './Toast.css';
import { type ReactNode, useEffect, useState } from 'react';

const TOAST_TIMEOUT = 3500;
const FADE_DURATION = 1500;

interface ToastProps {
  message: string;
  onHide?: () => void;
}

const Toast = ({ message }: ToastProps): ReactNode => {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, TOAST_TIMEOUT);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, TOAST_TIMEOUT + FADE_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    visible && (
      <div className={`toast ${fade ? 'fade-out' : ''}`}>
        <p>{message}</p>
        <button className="btn-wrapper ml-1" onClick={() => setVisible(false)}>
          <span className="text-shadow-3 ml-1 text-magenta">X</span>
        </button>
      </div>
    )
  );
};

export default Toast;
