import './Toast.css';
import { type ReactNode, useEffect, useRef, useState } from 'react';

const TOAST_TIMEOUT = 3500;
const FADE_DURATION = 1500;

interface ToastProps {
  message: string;
  onHide?: () => void;
}

const Toast = ({ message, onHide }: ToastProps): ReactNode => {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  /*
   * Keep the latest onHide in a ref so the auto-dismiss timers are NOT reset every time the
   * parent re-renders (use-toast hands a fresh closure each render). Without calling onHide the
   * toast only hid itself locally and was never removed from the parent's list — a slow leak.
   */
  const onHideRef = useRef(onHide);
  useEffect(() => {
    onHideRef.current = onHide;
  }, [onHide]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, TOAST_TIMEOUT);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      onHideRef.current?.();
    }, TOAST_TIMEOUT + FADE_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const dismiss = (): void => {
    setVisible(false);
    onHideRef.current?.();
  };

  return (
    visible && (
      <div className={`toast ${fade ? 'fade-out' : ''}`}>
        <p>{message}</p>
        <button className="btn-wrapper ml-1" onClick={dismiss}>
          <span className="text-shadow-3 ml-1 text-magenta">X</span>
        </button>
      </div>
    )
  );
};

export default Toast;
