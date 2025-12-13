import { useEffect, useRef } from 'react';
import { ANIMATION } from '../../../constants/animations';
import { isBreadType } from '../../../constants/ingredients-constants';
import { useSandwichContext } from '../../../context/SandwichContext';
import { cn } from '../../../utils/cn';
import SandwichLayerItem from './SandwichLayerItem';

const SandwichLayerStack = () => {
  const { sandwich, editingLayerIndex, isAddingLayer: _isAddingLayer, startEditingLayer } = useSandwichContext();
  const activeLayerRef = useRef(null);
  const prevEditingLayerIndexRef = useRef(editingLayerIndex);

  const handleEditLayer = (e, index) => {
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
    }
  }, [editingLayerIndex]);

  return (
    <div className="layer-stack relative mx-auto w-full">
      {/* Edit mode: layers displayed one after another vertically, from bottom to top (bread at bottom) */}
      <div className="flex flex-col">
        {sandwich.ingredients.toReversed().map((ingredient, reversedIndex) => {
          // Calculate original index (bread is at index 0, so it should be at the bottom)
          const originalIndex = sandwich.ingredients.length - 1 - reversedIndex;
          const layerKey = ingredient.id ?? `layer-${originalIndex}`;
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
