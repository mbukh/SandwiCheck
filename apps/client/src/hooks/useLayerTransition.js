import { useCallback, useEffect, useRef, useState } from 'react';
import { ANIMATION } from '../constants/animations';
import { calculateLayerHeight } from './useStableLayerHeight';

/**
 * Custom hook to manage layer transition state and animations
 * Handles entry/exit transitions, height preservation, and derived state
 */
export const useLayerTransition = ({ isActive, containerRef }) => {
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'image-out' | 'slider-in' | 'controls-in' | 'controls-out' | 'slider-out' | 'image-in' | 'delete-collapse'
  const [preservedHeight, setPreservedHeight] = useState(null);
  const prevIsActiveRef = useRef(isActive);
  const isDeletingRef = useRef(false);
  const entryTimeoutsRef = useRef([]);
  const exitTimeoutsRef = useRef([]);
  const isTransitioningRef = useRef(false);

  /*
   * Measure and preserve height when transitioning between states
   * This prevents collapse during transitions between image and swiper views
   * Only measures when buttons are pressed (edit/update/cancel), not continuously
   */
  const measureAndPreserveHeight = useCallback(() => {
    if (containerRef.current) {
      // Use getBoundingClientRect for more accurate measurement
      const rect = containerRef.current.getBoundingClientRect();
      const height = rect.height;
      // Only preserve if we have a valid height measurement
      if (height > 0) {
        setPreservedHeight(height);
        // Apply the height immediately to prevent collapse
        containerRef.current.style.height = `${height}px`;
      }
    }
  }, [containerRef]);

  // Clear preserved height after transition completes and new content is rendered
  const clearPreservedHeight = useCallback(() => {
    if (containerRef.current && preservedHeight !== null) {
      // Wait for next frame to ensure new content has rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.height = '';
            setPreservedHeight(null);
          }
        });
      });
    }
  }, [containerRef, preservedHeight]);

  // Start exit transition with proper height preservation
  const startExitTransition = useCallback(
    (isDeleting = false, onComplete) => {
      // Prevent rapid clicks - if already transitioning, ignore
      if (isTransitioningRef.current) {
        return;
      }
      isTransitioningRef.current = true;

      // Clear any pending entry and exit timeouts
      for (const timeout of entryTimeoutsRef.current) clearTimeout(timeout);
      entryTimeoutsRef.current = [];
      for (const timeout of exitTimeoutsRef.current) clearTimeout(timeout);
      exitTimeoutsRef.current = [];

      // If we're in an entry transition, wait for it to complete or force to stable state
      const isInEntryTransition =
        transitionState === 'image-out' || transitionState === 'slider-in' || transitionState === 'controls-in';

      const startExitSequence = () => {
        // Measure height right before starting exit transition
        measureAndPreserveHeight();
        isDeletingRef.current = isDeleting;
        // Step 1: Start controls fade-scale-out
        setTransitionState('controls-out');
      };

      if (isInEntryTransition) {
        /*
         * If we're in entry transition, force to controls-in state first
         * This ensures we can measure the correct swiper height
         */
        if (transitionState === 'controls-in') {
          // Already at controls-in, can start exit immediately
          startExitSequence();
        } else {
          setTransitionState('controls-in');
          // Wait for state to stabilize before starting exit
          const stabilizeTimer = setTimeout(() => {
            startExitSequence();
          }, 50);
          exitTimeoutsRef.current.push(stabilizeTimer);
        }
      } else {
        // Not in entry transition, start exit immediately
        startExitSequence();
      }

      // Step 2: After controls animation completes, fade out slider
      const sliderTimer = setTimeout(() => {
        setTransitionState('slider-out');

        // Step 3: After slider animation completes, either show image or collapse
        const finalTimer = setTimeout(() => {
          if (isDeleting) {
            // For delete: transition height to 0
            setTransitionState('delete-collapse');
            /*
             * Height collapse animation duration is 600ms
             * Call onComplete after collapse animation
             */
            if (onComplete) {
              const completeTimer = setTimeout(() => {
                isTransitioningRef.current = false;
                // Remove will-change after transition for better performance
                if (containerRef.current) {
                  containerRef.current.style.willChange = '';
                }
                onComplete();
              }, ANIMATION.DURATION.PREVIEW_COLLAPSE);
              exitTimeoutsRef.current.push(completeTimer);
            }
          } else {
            // For cancel/update: fade-scale-in the image
            setTransitionState('image-in');
            // Call onComplete after image fade-in and height transition
            if (onComplete) {
              const completeTimer = setTimeout(() => {
                // Transition height from swiper height to image height
                if (containerRef.current && preservedHeight !== null) {
                  /*
                   * Calculate target height based on image aspect ratio (650/360)
                   * Get current width to calculate natural image height
                   */
                  const containerWidth = containerRef.current.getBoundingClientRect().width;
                  const targetHeight = calculateLayerHeight(containerWidth);

                  // Ensure transition is set
                  containerRef.current.style.transition = `height ${ANIMATION.DURATION.STANDARD}ms ${ANIMATION.EASING.STANDARD}`;

                  // Transition to target height
                  requestAnimationFrame(() => {
                    if (containerRef.current) {
                      containerRef.current.style.height = `${targetHeight}px`;

                      // After height transition completes, clear preserved height and reset state
                      const heightTransitionTimer = setTimeout(() => {
                        // Clear preserved height synchronously so style object doesn't use it
                        if (containerRef.current) {
                          containerRef.current.style.height = '';
                          setPreservedHeight(null);
                        }
                        // Reset state to idle so edit button shows up
                        setTransitionState('idle');
                        isTransitioningRef.current = false;
                        // Remove will-change after transition for better performance
                        if (containerRef.current) {
                          containerRef.current.style.willChange = '';
                        }
                        onComplete();
                      }, ANIMATION.DURATION.STANDARD);
                      exitTimeoutsRef.current.push(heightTransitionTimer);
                    }
                  });
                } else {
                  // No preserved height, just reset state
                  setTransitionState('idle');
                  isTransitioningRef.current = false;
                  // Remove will-change after transition for better performance
                  if (containerRef.current) {
                    containerRef.current.style.willChange = '';
                  }
                  onComplete();
                }
              }, ANIMATION.DURATION.STANDARD);
              exitTimeoutsRef.current.push(completeTimer);
            }
          }
        }, ANIMATION.DURATION.STANDARD);
        exitTimeoutsRef.current.push(finalTimer);
      }, ANIMATION.DURATION.STANDARD);
      exitTimeoutsRef.current.push(sliderTimer);
    },
    [containerRef, measureAndPreserveHeight, transitionState, preservedHeight],
  );

  // Trigger height collapse when delete-collapse state is set
  useEffect(() => {
    if (transitionState === 'delete-collapse' && containerRef.current && preservedHeight !== null) {
      // Ensure preserved height is set first
      containerRef.current.style.height = `${preservedHeight}px`;
      // Use requestAnimationFrame to trigger transition to 0 in next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            // Trigger height transition to 0
            containerRef.current.style.height = '0';
          }
        });
      });
    }
  }, [containerRef, transitionState, preservedHeight]);

  useEffect(() => {
    // When transitioning from inactive to active (entering edit mode)
    if (!prevIsActiveRef.current && isActive) {
      // Clear any pending entry timeouts
      for (const timeout of entryTimeoutsRef.current) clearTimeout(timeout);
      entryTimeoutsRef.current = [];

      // Reset delete flag and ensure we're starting from a clean state
      isDeletingRef.current = false;

      // Only start transition if we're not already in an entry transition
      const isInEntryTransition =
        transitionState === 'image-out' || transitionState === 'slider-in' || transitionState === 'controls-in';

      if (!isInEntryTransition && !isTransitioningRef.current) {
        isTransitioningRef.current = true;
        // Clear any pending exit timeouts
        for (const timeout of exitTimeoutsRef.current) clearTimeout(timeout);
        exitTimeoutsRef.current = [];

        // Step 1: Start image fade-scale-out
        setTransitionState('image-out');

        // Step 2: After image animation completes, show slider
        const sliderTimer = setTimeout(() => {
          setTransitionState('slider-in');

          // Step 3: After slider animation completes, show controls
          const controlsTimer = setTimeout(() => {
            setTransitionState('controls-in');
            isTransitioningRef.current = false;
            // Remove will-change after transition for better performance
            if (containerRef.current) {
              containerRef.current.style.willChange = '';
            }
            /*
             * Keep preserved height throughout the active editing state
             * Only clear it when exiting edit mode to prevent height jumps
             */
          }, ANIMATION.DURATION.STANDARD);
          entryTimeoutsRef.current.push(controlsTimer);
        }, ANIMATION.DURATION.STANDARD);
        entryTimeoutsRef.current.push(sliderTimer);
      }
    } else if (prevIsActiveRef.current && !isActive) {
      /*
       * When transitioning from active to inactive (exiting edit mode)
       * Note: The actual exit transition is triggered by callbacks from LayerControls
       * This effect only handles the final cleanup after transition completes
       */
      // Clear any pending entry timeouts
      for (const timeout of entryTimeoutsRef.current) clearTimeout(timeout);
      entryTimeoutsRef.current = [];

      // If we're in an exit transition state, wait for it to complete
      const isInExitTransition =
        transitionState === 'controls-out' ||
        transitionState === 'slider-out' ||
        transitionState === 'image-in' ||
        transitionState === 'delete-collapse';

      if (!isInExitTransition) {
        // If not in exit transition, reset immediately (shouldn't happen normally)
        setTransitionState('idle');
        clearPreservedHeight();
      }
      // If in exit transition, let the onComplete callback handle cleanup
    }

    prevIsActiveRef.current = isActive;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, clearPreservedHeight]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      for (const timeout of entryTimeoutsRef.current) clearTimeout(timeout);
      entryTimeoutsRef.current = [];
      for (const timeout of exitTimeoutsRef.current) clearTimeout(timeout);
      exitTimeoutsRef.current = [];
    };
  }, []);

  // Determine if we're in an exit transition
  const isExiting =
    transitionState === 'controls-out' ||
    transitionState === 'slider-out' ||
    transitionState === 'image-in' ||
    transitionState === 'delete-collapse';

  /*
   * Show image when inactive, while idle, during image-out transition, or during image-in exit.
   * Including the idle state for active layers prevents a blank frame before the fade-out starts.
   */
  const showImage =
    (transitionState === 'idle' || transitionState === 'image-out' || transitionState === 'image-in' || !isActive) &&
    transitionState !== 'delete-collapse' &&
    transitionState !== 'slider-in' &&
    transitionState !== 'controls-in';
  // Show slider when active and past the image-out phase, or during slider-out exit transition
  const showSwiper =
    (isActive &&
      transitionState !== 'idle' &&
      transitionState !== 'image-out' &&
      transitionState !== 'image-in' &&
      transitionState !== 'delete-collapse') ||
    transitionState === 'slider-out';
  // Show controls only in the final phase, but not during exit
  const showControls =
    isActive && transitionState === 'controls-in' && transitionState !== 'controls-out' && !isExiting;

  return {
    transitionState,
    preservedHeight,
    isExiting,
    showImage,
    showSwiper,
    showControls,
    measureAndPreserveHeight,
    startExitTransition,
  };
};
