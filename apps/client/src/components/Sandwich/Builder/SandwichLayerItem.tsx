import { forwardRef, useRef } from 'react';
import { useLayerTransition } from '@/hooks/useLayerTransition';
import type { SandwichLayer } from '@/types/domain';
import { cn } from '@/utils/cn';
import LayerContentContainer from './LayerContentContainer';
import SandwichLayerEditButton from './SandwichLayerEditButton';

interface SandwichLayerItemProps {
  ingredient: SandwichLayer;
  originalIndex: number;
  isActive: boolean;
  isBread: boolean;
  handleEditLayer: (e: React.MouseEvent<HTMLButtonElement>, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const SandwichLayerItem = forwardRef<HTMLDivElement, SandwichLayerItemProps>(
  (
    { ingredient, originalIndex, isActive, isBread, handleEditLayer, className, style },
    layerRef,
  ): React.JSX.Element => {
    const containerRef = useRef<HTMLDivElement>(null);
    const moveToFirstSlideRef = useRef<(() => void) | null>(null);

    const {
      transitionState,
      preservedHeight,
      isExiting,
      showImage,
      showSwiper,
      showControls,
      measureAndPreserveHeight,
      startExitTransition,
    } = useLayerTransition({
      isActive,
      containerRef,
      skipImageEntry: Boolean(ingredient?.unconfirmed),
    });
    const shouldElevateZIndex = showSwiper;
    const baseZIndex = (style?.zIndex as number | undefined) ?? originalIndex;
    const mergedStyle: React.CSSProperties = {
      ...style,
      // Elevate only while the swiper is visible to keep z-index changes aligned with the fade/scale timings
      zIndex: shouldElevateZIndex ? Math.max(10, baseZIndex) : baseZIndex,
    };

    // Enhanced handleEditLayer that measures height before transition to edit mode
    const handleEditLayerWithMeasurement = (e: React.MouseEvent<HTMLButtonElement>, index: number): void => {
      // Measure current height (image view) before transitioning to swiper
      measureAndPreserveHeight();
      handleEditLayer(e, index);
    };

    return (
      <div
        ref={layerRef}
        data-layer-index={originalIndex}
        className={cn(
          'layer-item-wrapper w-full',
          { 'layer-active': isActive && !isExiting },
          { 'layer-bread': isBread },
          className,
        )}
        style={mergedStyle}
      >
        <div
          className={cn(
            'grid w-full grid-cols-[minmax(1rem,1fr)_auto_minmax(1rem,1fr)] items-center',
            (isActive || isExiting) && 'mb-2',
          )}
        >
          {/* Left spacer */}
          <div className="min-w-4" />

          {/* Center: Image container or Swiper */}
          <LayerContentContainer
            containerRef={containerRef}
            ingredient={ingredient}
            originalIndex={originalIndex}
            transitionState={transitionState}
            preservedHeight={preservedHeight}
            isExiting={isExiting}
            isActive={isActive}
            showImage={showImage}
            showSwiper={showSwiper}
            showControls={showControls}
            moveToFirstSlideRef={moveToFirstSlideRef}
            onUpdateOrCancel={(onComplete) => startExitTransition(false, onComplete)}
            onDelete={(onComplete) => startExitTransition(true, onComplete)}
          />

          {/* Right: Edit button section */}
          {!isActive && !isExiting && (
            <div className="relative flex h-full min-w-4 items-center justify-start">
              <SandwichLayerEditButton
                originalIndex={originalIndex}
                handleEditLayer={handleEditLayerWithMeasurement}
                className="absolute top-1/2 right-0 -translate-y-1/2 lg:relative lg:top-0 lg:left-0 lg:translate-y-0"
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

SandwichLayerItem.displayName = 'SandwichLayerItem';

export default SandwichLayerItem;
