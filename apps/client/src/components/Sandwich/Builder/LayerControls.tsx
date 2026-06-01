import { useEffect, useState } from 'react';
import { isBreadType, TYPE } from '@sandwicheck/shared';
import arrowDownImg from '@/assets/images/icons/arrow-down.svg';
import arrowUpImg from '@/assets/images/icons/arrow-up.svg';
import binImg from '@/assets/images/icons/bin.svg';
import portionImg from '@/assets/images/icons/portion.svg';
import { ANIMATION } from '@/constants/animations';
import { DEFAULT_PORTION, getNextIngredientType, getNextPortion } from '@/constants/ingredients-constants';
import { useIngredientsGlobalContext } from '@/context/IngredientsGlobalContext';
import { useSandwichContext } from '@/context/SandwichContext';
import useToast from '@/hooks/use-toast';
import { SANDWICH_ACTION } from '@/reducers/sandwich-reducer';
import type { SandwichLayer } from '@/types/domain';
import { cn } from '@/utils/cn';
import { getLayerTargetId } from '@/utils/layer-instance-utils';
import { doesStayKosherWithIngredient } from '@/utils/sandwich-utils';

interface LayerControlsProps {
  editingLayerIndex?: number;
  isAddingLayer?: boolean;
  onUpdateOrCancel?: (onComplete: () => void) => void;
  onDelete?: (onComplete: () => void) => void;
  onMoveToFirstSlide?: () => void;
  className?: string;
}

const LayerControls = ({
  editingLayerIndex: propEditingLayerIndex,
  isAddingLayer: propIsAddingLayer,
  onUpdateOrCancel,
  onDelete,
  onMoveToFirstSlide,
  className,
}: LayerControlsProps): React.JSX.Element | null => {
  const {
    sandwich,
    sandwichDispatch,
    currentIngredient,
    editingLayerIndex: contextEditingLayerIndex,
    isAddingLayer: contextIsAddingLayer,
    setEditingLayerIndex,
    hasToBeKosher,
    resetEditingState,
    layerAddedViaAddTopRef,
    setCurrentIngredient,
    selectedType,
    setSelectedType,
  } = useSandwichContext();

  const { ingredients: allIngredients } = useIngredientsGlobalContext();
  const { showToast, toastComponents } = useToast();
  const [addedLayerIndex, setAddedLayerIndex] = useState<number | null>(null);

  /* Use props if provided (for inline usage), otherwise use context (for standalone usage) */
  const hasPropEditingIndex = typeof propEditingLayerIndex === 'number';
  const hasPropIsAddingLayer = typeof propIsAddingLayer === 'boolean';
  const editingLayerIndex = hasPropEditingIndex ? propEditingLayerIndex : contextEditingLayerIndex;
  const isAddingLayer = hasPropIsAddingLayer ? propIsAddingLayer : contextIsAddingLayer;

  // Sync add-layer marker ref to state without reading refs during render.
  useEffect(() => {
    setAddedLayerIndex(layerAddedViaAddTopRef?.current ?? null);
  }, [layerAddedViaAddTopRef, editingLayerIndex, isAddingLayer]);

  /*
   * If props are provided, we're being used inline in a layer item.
   * If no props, we're in SandwichBuilder and should only show when adding a new layer
   */
  const isInlineUsage = hasPropEditingIndex || hasPropIsAddingLayer;
  const hasEditingIndex = editingLayerIndex !== null;
  const isVisible = isInlineUsage ? hasEditingIndex || isAddingLayer : isAddingLayer;
  const isEditingExisting = editingLayerIndex !== null;
  const isEmptyIngredient = !currentIngredient?.id;
  // Allow update when editing existing layer and first option (remove) is selected
  const canUpdateWithEmpty = isEditingExisting && isEmptyIngredient;

  // Determine if we're inserting at a specific index (when isAddingLayer is true and editingLayerIndex is not null)
  const isInsertingAtIndex = isAddingLayer && editingLayerIndex !== null;
  const editingIngredient = isEditingExisting ? sandwich.ingredients[editingLayerIndex] : null;
  const isEditingAddedLayer =
    editingLayerIndex !== null && (Boolean(editingIngredient?.unconfirmed) || addedLayerIndex === editingLayerIndex);
  const isAddingNewLayer = isAddingLayer || isEditingAddedLayer;

  // Initialize selectedType and currentIngredient when adding layer or editing layer added via addTopLayer
  useEffect(() => {
    if (isAddingNewLayer && !selectedType && Object.keys(allIngredients).length > 0) {
      // If currentIngredient is set (e.g., from addTopLayer or startAddingLayer), use its type
      if (currentIngredient?.type && allIngredients[currentIngredient.type]) {
        setSelectedType(currentIngredient.type);
      } else if (editingLayerIndex === null) {
        // Adding new layer with no layer being edited (e.g. startAddingLayer when only bread)
        const hasBread = sandwich.ingredients.some((ing) => isBreadType(ing.type));
        if (hasBread) {
          const topLayer = sandwich.ingredients.at(-1);
          if (topLayer) {
            const nextType = getNextIngredientType(topLayer.type);
            const list = allIngredients[nextType];
            if (list && list.length > 0) {
              setSelectedType(nextType);
              const kosherList = hasToBeKosher
                ? list.filter((ing) => doesStayKosherWithIngredient(ing, sandwich))
                : list;
              const pool = kosherList.length > 0 ? kosherList : list;
              const randomIngredient = pool[Math.floor(Math.random() * pool.length)];
              if (randomIngredient) {
                setCurrentIngredient(randomIngredient);
              }
            }
          }
        } else {
          setSelectedType(TYPE.bread);
        }
      } else {
        // Use the type of the layer being edited
        const editingType = sandwich.ingredients[editingLayerIndex]?.type;
        if (editingType && allIngredients[editingType]) {
          setSelectedType(editingType);
        }
      }
    }
  }, [
    isAddingNewLayer,
    selectedType,
    allIngredients,
    sandwich,
    currentIngredient,
    editingLayerIndex,
    setSelectedType,
    setCurrentIngredient,
    hasToBeKosher,
  ]);

  // Clear selectedType when not adding/editing
  useEffect(() => {
    if (!isVisible) {
      setSelectedType('');
    }
  }, [isVisible, setSelectedType]);

  const handleTypeSelect = (type: string): void => {
    setSelectedType(type);
    setCurrentIngredient({});
  };

  // Get the ingredient being edited (if any)
  const isStillKosher = currentIngredient
    ? doesStayKosherWithIngredient(currentIngredient as SandwichLayer, sandwich)
    : true;
  const targetLayerId = getLayerTargetId(editingIngredient ?? undefined);

  const handleConfirm = (): void => {
    // If editing existing and first option (remove) is selected, remove the layer
    if (isEditingExisting && isEmptyIngredient) {
      // Prevent removing bread (bread is always at index 0)
      if (editingLayerIndex === 0 || editingIngredient?.type === 'bread') {
        showToast('Bread cannot be removed');
        return;
      }

      /*
       * Get the target layer ID from the current sandwich state to ensure we have the correct ID
       * This is important because the ingredient might have been updated during editing
       */
      const currentIngredientInSandwich = sandwich.ingredients[editingLayerIndex];
      const layerIdToRemove = currentIngredientInSandwich
        ? getLayerTargetId(currentIngredientInSandwich)
        : targetLayerId;

      if (!layerIdToRemove) {
        showToast('Unable to identify layer to remove');
        return;
      }

      // Start exit transition with delete intent
      if (onDelete) {
        onDelete(() => {
          /*
           * Remove ingredient and reset state after collapse animation completes
           * The ingredient removal happens synchronously, then state is reset
           */
          sandwichDispatch({ type: SANDWICH_ACTION.REMOVE_INGREDIENT, payload: layerIdToRemove });
          resetEditingState(false);
        });
      } else {
        // Fallback: remove immediately if no callback provided
        sandwichDispatch({ type: SANDWICH_ACTION.REMOVE_INGREDIENT, payload: layerIdToRemove });
        resetEditingState(false);
      }
      return;
    }

    if (isEmptyIngredient) {
      showToast('Please select an ingredient first');
      return;
    }

    // After the empty-ingredient guards, the current ingredient is a fully hydrated layer.
    const selectedIngredient = currentIngredient as SandwichLayer;

    if (hasToBeKosher && !isStillKosher) {
      showToast('Account set to kosher: cannot mix meat and dairy');
      return;
    }

    if (isAddingLayer) {
      // If no bread exists, bread must be added first
      const hasBread = sandwich.ingredients.some((ing) => isBreadType(ing.type));
      if (!hasBread && !isBreadType(selectedIngredient.type)) {
        showToast('Please add bread first');
        return;
      }

      // Prevent adding bread if bread already exists (only one bread allowed)
      if (isBreadType(selectedIngredient.type)) {
        if (hasBread) {
          showToast('Only one bread layer is allowed. Edit the existing bread to change it.');
          return;
        }
        // Add bread as first ingredient (only if no bread exists)
        sandwichDispatch({
          type: SANDWICH_ACTION.UPDATE_INGREDIENTS,
          payload: [{ ...selectedIngredient }, ...sandwich.ingredients],
        });
      } else if (isInsertingAtIndex && editingLayerIndex !== null) {
        // Inserting at a specific index (adding between layers)
        sandwichDispatch({
          type: SANDWICH_ACTION.INSERT_INGREDIENT_AT,
          payload: {
            ingredient: selectedIngredient,
            index: editingLayerIndex,
          },
        });
      } else {
        // Adding at the end (normal add)
        sandwichDispatch({
          type: SANDWICH_ACTION.ADD_INGREDIENT,
          payload: selectedIngredient,
        });
      }
    } else if (isEditingExisting) {
      /*
       * Updating existing ingredient - replace at index
       * Ensure bread stays at index 0
       * Preserve the portion from the editing layer if it's the same ingredient,
       * otherwise use default portion for the new ingredient
       * Remove unconfirmed flag when confirming
       */
      const { unconfirmed: _unconfirmed, ...ingredientWithoutUnconfirmed } = selectedIngredient;
      const confirmedPortion = isAddingNewLayer
        ? selectedIngredient.portion || editingIngredient?.portion || DEFAULT_PORTION
        : editingIngredient?.portion || selectedIngredient.portion || DEFAULT_PORTION;
      const editingIngredientWithPortion: SandwichLayer = {
        ...ingredientWithoutUnconfirmed,
        layerInstanceId: editingIngredient?.layerInstanceId,
        portion: confirmedPortion,
      };

      // Prevent changing a non-bread layer to bread if bread already exists (only one bread allowed)
      if (isBreadType(selectedIngredient.type) && !isBreadType(editingIngredient?.type ?? '')) {
        const hasBread = sandwich.ingredients.some((ing) => isBreadType(ing.type));
        if (hasBread) {
          showToast('Only one bread layer is allowed. Edit the existing bread to change it.');
          return;
        }
      }

      if (isBreadType(selectedIngredient.type) && editingLayerIndex !== 0) {
        // Moving bread to index 0
        const newIngredients = [...sandwich.ingredients];
        newIngredients[editingLayerIndex] = editingIngredientWithPortion;
        // Move bread to front
        const bread = newIngredients.splice(editingLayerIndex, 1)[0];
        if (bread) {
          newIngredients.unshift(bread);
        }
        sandwichDispatch({
          type: SANDWICH_ACTION.UPDATE_INGREDIENTS,
          payload: newIngredients,
        });
        setEditingLayerIndex(0);
      } else if (editingLayerIndex === 0 && !isBreadType(selectedIngredient.type)) {
        // Cannot replace bread with non-bread
        showToast('Bread must always be present');
        return;
      } else {
        const newIngredients = [...sandwich.ingredients];
        newIngredients[editingLayerIndex] = editingIngredientWithPortion;
        sandwichDispatch({
          type: SANDWICH_ACTION.UPDATE_INGREDIENTS,
          payload: newIngredients,
        });
      }
    }

    // Start exit transition (will measure height and handle state reset after animation)
    if (onUpdateOrCancel) {
      onUpdateOrCancel(() => {
        resetEditingState(false);
      });
    } else {
      // Fallback: reset state immediately if no callback provided
      resetEditingState(false);
    }
  };

  const handleRemove = (): void => {
    // Move swiper to first (left) position (the "none" slide) to prepare for deletion
    if (onMoveToFirstSlide) {
      onMoveToFirstSlide();
    }
    // Set current ingredient to empty to enable the delete confirmation
    setCurrentIngredient({});
  };

  const handleMoveUp = (): void => {
    // Move up visually = move towards top = increase index in array
    if (editingIngredient && editingLayerIndex !== null && editingLayerIndex < sandwich.ingredients.length - 1) {
      const newIndex = editingLayerIndex + 1;
      const newIngredients = [...sandwich.ingredients];
      [newIngredients[editingLayerIndex], newIngredients[newIndex]] = [
        newIngredients[newIndex] as SandwichLayer,
        newIngredients[editingLayerIndex] as SandwichLayer,
      ];

      sandwichDispatch({
        type: SANDWICH_ACTION.UPDATE_SANDWICH,
        payload: { ...sandwich, ingredients: newIngredients },
      });
      setEditingLayerIndex(newIndex);
    }
  };

  const handleMoveDown = (): void => {
    /*
     * Move down visually = move towards bottom = decrease index in array
     * Can't move below bread (index 0) - bread must stay at bottom
     */
    if (editingIngredient && editingLayerIndex !== null && editingLayerIndex > 1) {
      const newIndex = editingLayerIndex - 1;
      // Prevent moving to index 0 (bread position) or below bread
      if (newIndex === 0) {
        showToast('Cannot move below bread');
        return;
      }
      const newIngredients = [...sandwich.ingredients];
      [newIngredients[editingLayerIndex], newIngredients[newIndex]] = [
        newIngredients[newIndex] as SandwichLayer,
        newIngredients[editingLayerIndex] as SandwichLayer,
      ];

      sandwichDispatch({
        type: SANDWICH_ACTION.UPDATE_SANDWICH,
        payload: { ...sandwich, ingredients: newIngredients },
      });
      setEditingLayerIndex(newIndex);
    }
  };

  const handleChangePortion = (): void => {
    if (isAddingNewLayer) {
      setCurrentIngredient((prev) => {
        if (!prev?.id) return prev;
        return {
          ...prev,
          portion: getNextPortion(prev.portion || DEFAULT_PORTION),
        };
      });
    } else if (editingIngredient && targetLayerId) {
      sandwichDispatch({ type: SANDWICH_ACTION.CYCLE_PORTION, payload: targetLayerId });
    }
  };

  const handleCancel = (): void => {
    const isAddingNewLayerLocal = isAddingLayer || isEditingAddedLayer;

    // If canceling edit of layer added via addTopLayer, remove it from sandwich
    if (editingLayerIndex !== null && isEditingAddedLayer) {
      const targetLayerIdToRemove = getLayerTargetId(sandwich.ingredients[editingLayerIndex]);

      // Use same animation as delete/confirm when adding a new layer
      if (targetLayerIdToRemove) {
        if (onDelete) {
          onDelete(() => {
            sandwichDispatch({ type: SANDWICH_ACTION.REMOVE_INGREDIENT, payload: targetLayerIdToRemove });
            resetEditingState(false);
          });
        } else {
          // Fallback: remove immediately if no callback provided
          sandwichDispatch({ type: SANDWICH_ACTION.REMOVE_INGREDIENT, payload: targetLayerIdToRemove });
          resetEditingState(false);
        }
      }
      return;
    }

    /*
     * For regular cancel (not adding new layer), use update/cancel animation
     * For adding new layer (standalone), use same animation as confirm
     */
    if (isAddingNewLayerLocal) {
      // When adding a new layer, cancel should use the same animation as confirm
      if (onUpdateOrCancel) {
        onUpdateOrCancel(() => {
          resetEditingState(false);
        });
      } else {
        // Fallback: reset state immediately if no callback provided
        resetEditingState(false);
      }
    } else {
      // Regular cancel for editing existing layer
      if (onUpdateOrCancel) {
        onUpdateOrCancel(() => {
          resetEditingState(true);
        });
      } else {
        // Fallback: reset state immediately if no callback provided
        resetEditingState(true);
      }
    }
  };

  // Don't show anything when not editing/adding
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn('layer-controls mt-2 flex flex-col items-center gap-3 transition-all', className)}
      style={{
        transitionDuration: `${ANIMATION.DURATION.STANDARD}ms`,
        transitionTimingFunction: ANIMATION.EASING.STANDARD,
      }}
    >
      {/* Type Selector - Show when adding new layer or editing layer added via addTopLayer */}
      {isAddingNewLayer && (
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 rounded-lg bg-white p-3 shadow-lg">
            {Object.keys(allIngredients)
              .filter((type) => {
                // Exclude bread type if bread already exists (only one bread allowed)
                const hasBread = sandwich.ingredients.some((ing) => isBreadType(ing.type));
                return !isBreadType(type) || !hasBread;
              })
              .map((type) => (
                <button
                  key={type}
                  className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                    selectedType === type ? 'bg-magenta text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleTypeSelect(type)}
                >
                  {type}
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
        {/* Portion Control (when editing existing or adding new layer, not bread) */}
        {((isEditingExisting && editingIngredient?.type !== 'bread') ||
          (isAddingNewLayer && selectedType && !isBreadType(selectedType))) && (
          <button
            className="btn-wrapper p-3 transition-transform hover:scale-110 active:scale-95"
            onClick={handleChangePortion}
            title="Change portion"
          >
            <img src={portionImg} alt="Portion" width="28" height="28" />
          </button>
        )}

        {/* Reorder Controls (when editing existing, not bread, not adding new layer) */}
        {isEditingExisting && editingLayerIndex > 0 && !isAddingNewLayer && (
          <>
            <button
              className="btn-wrapper p-2 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
              onClick={handleMoveUp}
              disabled={editingLayerIndex >= sandwich.ingredients.length - 1}
              title="Move up"
            >
              <img src={arrowUpImg} alt="Move up" width="20" height="20" />
            </button>
            <button
              className="btn-wrapper p-2 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
              onClick={handleMoveDown}
              disabled={editingLayerIndex <= 1}
              title="Move down"
            >
              <img src={arrowDownImg} alt="Move down" width="20" height="20" />
            </button>
          </>
        )}

        {/* Remove Button (when editing existing, not bread, and not adding a new layer) */}
        {isEditingExisting && editingLayerIndex > 0 && !isAddingLayer && !isEditingAddedLayer && (
          <button
            className="btn-wrapper p-2 text-red-500 transition-transform hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
            onClick={handleRemove}
            disabled={isEmptyIngredient}
            title="Remove layer"
          >
            <img src={binImg} alt="Remove" width="18" height="20" />
          </button>
        )}

        {/* Confirm Button */}
        <button
          className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all ${
            isEmptyIngredient && !canUpdateWithEmpty
              ? 'cursor-not-allowed bg-gray-300 text-gray-500'
              : 'bg-magenta text-white hover:scale-105 hover:bg-magenta/90'
          }`}
          onClick={handleConfirm}
          disabled={
            (isEmptyIngredient && !canUpdateWithEmpty) || (hasToBeKosher && !isStillKosher && !isEmptyIngredient)
          }
        >
          {isAddingLayer || isEditingAddedLayer ? 'Add' : 'Update'}
        </button>

        {/* Cancel Button */}
        <button className="rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" onClick={handleCancel}>
          Cancel
        </button>
      </div>
      {toastComponents}
    </div>
  );
};

export default LayerControls;
