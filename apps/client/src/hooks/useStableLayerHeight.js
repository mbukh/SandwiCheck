import { useEffect, useMemo, useState } from 'react';

const ASPECT_WIDTH = 650;
const ASPECT_HEIGHT = 360;
const MIN_HEIGHT = 200;
const MAX_HEIGHT_VH = 60;
const MAX_REF_WIDTH = 540;

export const calculateLayerHeight = (
  width,
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0,
) => {
  if (!width || !viewportHeight) return null;
  const aspectRatio = ASPECT_HEIGHT / ASPECT_WIDTH;
  const effectiveWidth = Math.min(width, MAX_REF_WIDTH);
  const preferred = effectiveWidth * aspectRatio;
  const maxByViewport = (viewportHeight * MAX_HEIGHT_VH) / 100;
  return Math.max(MIN_HEIGHT, Math.min(preferred, maxByViewport));
};

/**
 * Keeps layer container height stable based on viewport and container width.
 * Height is derived from a fixed aspect ratio and clamped to viewport bounds,
 * so toggling between image and edit modes does not change the layout.
 */
export const useStableLayerHeight = (containerRef) => {
  const aspectRatio = useMemo(() => ASPECT_HEIGHT / ASPECT_WIDTH, []);
  const [stableHeight, setStableHeight] = useState(null);

  useEffect(() => {
    const updateHeight = () => {
      const width = containerRef.current?.getBoundingClientRect().width;
      const nextHeight = calculateLayerHeight(width);
      setStableHeight(nextHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    const element = containerRef.current;
    if (element) {
      resizeObserver.observe(element);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
    };
  }, [aspectRatio, containerRef]);

  return stableHeight;
};
