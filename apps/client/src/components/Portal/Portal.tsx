import { type ReactNode, type ReactPortal, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children?: ReactNode;
  className?: string;
  el?: string;
}

const Portal = ({ children, className = 'root-portal', el = 'div' }: PortalProps): ReactPortal => {
  // Created once on the initial render (lazy initial state).
  const [container] = useState(() => document.createElement(el));

  useEffect(() => {
    container.classList.add(className);
    document.body.append(container);
    return () => {
      container.remove();
    };
  }, [className, container]);

  return createPortal(children, container);
};

export default Portal;
