import { useEffect, useRef } from 'react';
import { isBreadType, MAX_INGREDIENTS_COUNT } from '@sandwicheck/shared';
import { ANIMATION } from '@/constants/animations';
import { useSandwichContext } from '@/context/SandwichContext';
import { cn } from '@/utils/cn';
import { getLayerTargetId } from '@/utils/layer-instance-utils';
import SandwichLayerItem from './SandwichLayerItem';

const SandwichLayerStack = (): React.JSX.Element => {
  const { sandwich, editingLayerIndex, isAddingLayer, startEditingLayer, startAddingLayer } = useSandwichContext();
  const activeLayerRef = useRef<HTMLDivElement>(null);
  const prevEditingLayerIndexRef = useRef<number | null>(editingLayerIndex);
  const hasLayers = sandwich.ingredients.length > 0;
  const isAtMaxLayers = sandwich.ingredients.length >= MAX_INGREDIENTS_COUNT;

  const handleEditLayer = (e: React.MouseEvent<HTMLButtonElement>, index: number): void => {
    e.stopPropagation();
    startEditingLayer(index);
  };

  // Smooth scroll to active layer when editingLayerIndex changes
  useEffect(() => {
    // Only scroll if we're in editing mode and the index actually changed
    if (editingLayerIndex !== null && editingLayerIndex !== prevEditingLayerIndexRef.current) {
      /*
       * Wait for layer reorder animation to complete before scrolling.
       * This ensures the layer has reached its final position before we scroll to it.
       * Using a slight delay after the animation duration to ensure DOM has fully updated.
       */
      const scrollTimer = setTimeout(() => {
        if (activeLayerRef.current) {
          activeLayerRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }, ANIMATION.DURATION.LAYER_REORDER + 50); // Wait for animation + small buffer

      prevEditingLayerIndexRef.current = editingLayerIndex;

      return () => clearTimeout(scrollTimer);
    } else {
      prevEditingLayerIndexRef.current = editingLayerIndex;
      return;
    }
  }, [editingLayerIndex]);

  return (
    <div className="layer-stack relative mx-auto w-full">
      <button
        className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-magenta shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={startAddingLayer}
        disabled={!hasLayers || isAtMaxLayers || isAddingLayer || editingLayerIndex !== null}
        title={
          isAtMaxLayers
            ? `Maximum of ${MAX_INGREDIENTS_COUNT} layers reached`
            : isAddingLayer || editingLayerIndex !== null
              ? 'Please finish adding or editing the current layer'
              : 'Add the next layer'
        }
      >
        Add layer
      </button>

      {/* Edit mode: layers displayed one after another vertically, from bottom to top (bread at bottom) */}
      <div className="flex flex-col pt-6">
        {sandwich.ingredients.toReversed().map((ingredient, reversedIndex) => {
          // Calculate original index (bread is at index 0, so it should be at the bottom)
          const originalIndex = sandwich.ingredients.length - 1 - reversedIndex;
          // Use layerInstanceId as key for proper React reconciliation with added layers
          const layerKey = getLayerTargetId(ingredient) ?? `layer-${originalIndex}`;
          const isFirst = reversedIndex === 0;
          const isActive = editingLayerIndex === originalIndex;

          return (
            <SandwichLayerItem
              key={layerKey}
              ref={isActive ? activeLayerRef : null}
              ingredient={ingredient}
              originalIndex={originalIndex}
              isActive={isActive}
              isBread={isBreadType(ingredient.type)}
              handleEditLayer={handleEditLayer}
              className={cn('transition-[margin-top]', !isFirst && '-mt-12')}
              style={{
                zIndex: originalIndex,
                transitionDuration: `${ANIMATION.DURATION.STANDARD}ms`,
                transitionTimingFunction: ANIMATION.EASING.STANDARD,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SandwichLayerStack;
