import { ANIMATION } from '../../../constants/animations';
import { useStableLayerHeight } from '../../../hooks/useStableLayerHeight';
import { cn } from '../../../utils/cn';
import LayerControls from './LayerControls';
import LayerImageView from './LayerImageView';
import LayerSwiper from './LayerSwiper';

/**
 * Container component that manages the transition between image and swiper views
 * Handles height preservation and transition styling
 */
const LayerContentContainer = ({
  containerRef,
  ingredient,
  originalIndex,
  transitionState,
  preservedHeight,
  isExiting,
  isActive,
  showImage,
  showSwiper,
  showControls,
  moveToFirstSlideRef,
  onUpdateOrCancel,
  onDelete,
}) => {
  const stableHeight = useStableLayerHeight(containerRef);
  const resolvedHeight = preservedHeight ?? stableHeight;
  const deleteCollapseActive = transitionState === 'delete-collapse' && resolvedHeight !== null;

  return (
    <div
      ref={containerRef}
      className={cn('relative min-w-0', transitionState === 'delete-collapse' && 'layer-collapse')}
      style={{
        // Optimize for animations during transitions
        willChange: isExiting || isActive ? 'transform, opacity, height' : 'auto',
        // Keep a predictable height driven by viewport or preserved measurement; avoid extra height transitions
        ...(resolvedHeight && !deleteCollapseActive ? { height: `${resolvedHeight}px` } : {}),
        ...(deleteCollapseActive
          ? {
              /*
               * For delete collapse, transition height to 0 with opacity fade
               * Height starts at preserved height, then transitions to 0 via useEffect
               */
              height: `${resolvedHeight}px`,
              transition: `height ${ANIMATION.DURATION.PREVIEW_COLLAPSE}ms ${ANIMATION.EASING.STANDARD}, opacity ${ANIMATION.DURATION.PREVIEW_COLLAPSE}ms ${ANIMATION.EASING.STANDARD}`,
              opacity: 1,
            }
          : {}),
      }}
    >
      {/* Static Image - fades-scales-out when transitioning to active, fades-scales-in when exiting */}
      {showImage && (
        <LayerImageView
          ingredient={ingredient}
          originalIndex={originalIndex}
          transitionState={transitionState}
          showSwiper={showSwiper}
        />
      )}

      {/* Swiper - fades-scales-in after image animation, fades-scales-out when exiting */}
      {showSwiper && (
        <div className="flex h-full flex-col">
          <LayerSwiper
            editingLayerIndex={originalIndex}
            isAddingLayer={false}
            onSwiperReady={(moveToFirstSlide) => {
              moveToFirstSlideRef.current = moveToFirstSlide;
            }}
            className={cn(
              'layer-slider-container mb-2',
              transitionState === 'slider-in' && 'slider-fade-scale-in',
              transitionState === 'slider-out' && 'slider-fade-scale-out',
              showImage && showSwiper && 'absolute inset-0',
            )}
          />

          {/* Layer Controls - fades-scales-in after swiper, fades-scales-out when exiting */}
          {/* Always render container when swiper is shown to reserve space and prevent height jump */}
          <LayerControls
            editingLayerIndex={originalIndex}
            isAddingLayer={false}
            onUpdateOrCancel={onUpdateOrCancel}
            onDelete={onDelete}
            onMoveToFirstSlide={() => {
              if (moveToFirstSlideRef.current) {
                moveToFirstSlideRef.current();
              }
            }}
            className={cn(
              'm-0 my-auto flex justify-center p-0',
              { 'controls-fade-scale-in': transitionState === 'controls-in' },
              { 'controls-fade-scale-out': transitionState === 'controls-out' },
              { invisible: !showControls && transitionState !== 'controls-out' },
            )}
          />
        </div>
      )}
    </div>
  );
};

export default LayerContentContainer;
