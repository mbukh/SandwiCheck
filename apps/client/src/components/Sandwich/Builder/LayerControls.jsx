import arrowDownImg from '../../../assets/images/icons/arrow-down.svg';
import arrowUpImg from '../../../assets/images/icons/arrow-up.svg';
import binImg from '../../../assets/images/icons/bin.svg';
import portionImg from '../../../assets/images/icons/portion.svg';
import { ANIMATION } from '../../../constants/animations';
import { DEFAULT_PORTION } from '../../../constants/ingredients-constants';
import { useSandwichContext } from '../../../context/SandwichContext';
import useToast from '../../../hooks/use-toast';
import { cn } from '../../../utils/cn';
import { doesStayKosherWithIngredient } from '../../../utils/sandwich-utils';

const LayerControls = ({
  editingLayerIndex: propEditingLayerIndex,
  isAddingLayer: propIsAddingLayer,
  onUpdateOrCancel,
  onDelete,
  onMoveToFirstSlide,
  className,
}) => {
  const {
    sandwich,
    sandwichDispatch,
    currentIngredient,
    editingLayerIndex: contextEditingLayerIndex,
    isAddingLayer: contextIsAddingLayer,
    setEditingLayerIndex,
    hasToBeKosher,
    resetEditingState,
  } = useSandwichContext();

  const { showToast, toastComponents } = useToast();

  /* Use props if provided (for inline usage), otherwise use context (for standalone usage) */
  const hasPropEditingIndex = typeof propEditingLayerIndex === 'number';
  const hasPropIsAddingLayer = typeof propIsAddingLayer === 'boolean';
  const editingLayerIndex = hasPropEditingIndex ? propEditingLayerIndex : contextEditingLayerIndex;
  const isAddingLayer = hasPropIsAddingLayer ? propIsAddingLayer : contextIsAddingLayer;

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

  // Get the ingredient being edited (if any)
  const editingIngredient = isEditingExisting ? sandwich.ingredients[editingLayerIndex] : null;
  const isStillKosher = currentIngredient ? doesStayKosherWithIngredient(currentIngredient, sandwich) : true;

  const handleConfirm = () => {
    // If editing existing and first option (remove) is selected, remove the layer
    if (isEditingExisting && isEmptyIngredient) {
      // Prevent removing bread (bread is always at index 0)
      if (editingLayerIndex === 0 || editingIngredient?.type === 'bread') {
        showToast('Bread cannot be removed');
        return;
      }

      // Start exit transition with delete intent
      if (onDelete) {
        onDelete(() => {
          // Remove ingredient and reset state after collapse animation completes
          sandwichDispatch({ type: 'REMOVE_INGREDIENT', payload: editingIngredient.id });
          resetEditingState(false);
        });
      } else {
        // Fallback: remove immediately if no callback provided
        sandwichDispatch({ type: 'REMOVE_INGREDIENT', payload: editingIngredient.id });
        resetEditingState(false);
      }
      return;
    }

    if (isEmptyIngredient) {
      showToast('Please select an ingredient first');
      return;
    }

    if (hasToBeKosher && !isStillKosher) {
      showToast('Account set to kosher: cannot mix meat and dairy');
      return;
    }

    if (isAddingLayer) {
      // If no bread exists, bread must be added first
      const hasBread = sandwich.ingredients.some((ing) => ing.type === 'bread');
      if (!hasBread && currentIngredient.type !== 'bread') {
        showToast('Please add bread first');
        return;
      }

      // If bread exists, ensure bread stays at index 0
      if (currentIngredient.type === 'bread') {
        // Replace bread if it exists, or add as first ingredient
        const breadIndex = sandwich.ingredients.findIndex((ing) => ing.type === 'bread');
        if (breadIndex === -1) {
          // Add bread as first ingredient
          sandwichDispatch({
            type: 'UPDATE_INGREDIENTS',
            payload: [{ ...currentIngredient }, ...sandwich.ingredients],
          });
        } else {
          const newIngredients = [...sandwich.ingredients];
          newIngredients[breadIndex] = { ...currentIngredient };
          sandwichDispatch({
            type: 'UPDATE_INGREDIENTS',
            payload: newIngredients,
          });
        }
      } else if (isInsertingAtIndex) {
        // Inserting at a specific index (adding between layers)
        sandwichDispatch({
          type: 'INSERT_INGREDIENT_AT',
          payload: {
            ingredient: currentIngredient,
            index: editingLayerIndex,
          },
        });
      } else {
        // Adding at the end (normal add)
        sandwichDispatch({
          type: 'ADD_INGREDIENT',
          payload: currentIngredient,
        });
      }
    } else if (isEditingExisting) {
      /*
       * Updating existing ingredient - replace at index
       * Ensure bread stays at index 0
       * Preserve the portion from the editing layer if it's the same ingredient,
       * otherwise use default portion for the new ingredient
       */
      const isSameIngredient = editingIngredient?.id === currentIngredient?.id;
      const editingIngredientWithPortion = {
        ...currentIngredient,
        portion: isSameIngredient
          ? editingIngredient?.portion || currentIngredient.portion || DEFAULT_PORTION
          : currentIngredient.portion || DEFAULT_PORTION,
      };

      if (currentIngredient.type === 'bread' && editingLayerIndex !== 0) {
        // Moving bread to index 0
        const newIngredients = [...sandwich.ingredients];
        newIngredients[editingLayerIndex] = editingIngredientWithPortion;
        // Move bread to front
        const bread = newIngredients.splice(editingLayerIndex, 1)[0];
        newIngredients.unshift(bread);
        sandwichDispatch({
          type: 'UPDATE_INGREDIENTS',
          payload: newIngredients,
        });
        setEditingLayerIndex(0);
      } else if (editingLayerIndex === 0 && currentIngredient.type !== 'bread') {
        // Cannot replace bread with non-bread
        showToast('Bread must always be present');
        return;
      } else {
        const newIngredients = [...sandwich.ingredients];
        newIngredients[editingLayerIndex] = editingIngredientWithPortion;
        sandwichDispatch({
          type: 'UPDATE_INGREDIENTS',
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

  const handleRemove = () => {
    // Move swiper to first (left) position only
    if (onMoveToFirstSlide) {
      onMoveToFirstSlide();
    }
  };

  const handleMoveUp = () => {
    // Move up visually = move towards top = increase index in array
    if (editingIngredient && editingLayerIndex < sandwich.ingredients.length - 1) {
      const newIndex = editingLayerIndex + 1;
      const newIngredients = [...sandwich.ingredients];
      [newIngredients[editingLayerIndex], newIngredients[newIndex]] = [
        newIngredients[newIndex],
        newIngredients[editingLayerIndex],
      ];

      sandwichDispatch({ type: 'UPDATE_SANDWICH', payload: { ...sandwich, ingredients: newIngredients } });
      setEditingLayerIndex(newIndex);
    }
  };

  const handleMoveDown = () => {
    /*
     * Move down visually = move towards bottom = decrease index in array
     * Can't move below bread (index 0) - bread must stay at bottom
     */
    if (editingIngredient && editingLayerIndex > 1) {
      const newIndex = editingLayerIndex - 1;
      // Prevent moving to index 0 (bread position) or below bread
      if (newIndex === 0) {
        showToast('Cannot move below bread');
        return;
      }
      const newIngredients = [...sandwich.ingredients];
      [newIngredients[editingLayerIndex], newIngredients[newIndex]] = [
        newIngredients[newIndex],
        newIngredients[editingLayerIndex],
      ];

      sandwichDispatch({ type: 'UPDATE_SANDWICH', payload: { ...sandwich, ingredients: newIngredients } });
      setEditingLayerIndex(newIndex);
    }
  };

  const handleChangePortion = () => {
    if (editingIngredient) {
      sandwichDispatch({ type: 'CYCLE_PORTION', payload: editingIngredient.id });
    }
  };

  const handleCancel = () => {
    // Start exit transition (will measure height and handle state reset after animation)
    if (onUpdateOrCancel) {
      onUpdateOrCancel(() => {
        resetEditingState(true);
      });
    } else {
      // Fallback: reset state immediately if no callback provided
      resetEditingState(true);
    }
  };

  // Don't show anything when not editing/adding
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn('layer-controls mt-2 flex justify-center transition-all', className)}
      style={{
        transitionDuration: `${ANIMATION.DURATION.STANDARD}ms`,
        transitionTimingFunction: ANIMATION.EASING.STANDARD,
      }}
    >
      <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
        {/* Portion Control (when editing existing, not bread) */}
        {isEditingExisting && editingIngredient?.type !== 'bread' && (
          <button
            className="btn-wrapper p-3 transition-transform hover:scale-110 active:scale-95"
            onClick={handleChangePortion}
            title="Change portion"
          >
            <img src={portionImg} alt="Portion" width="28" height="28" />
          </button>
        )}

        {/* Reorder Controls (when editing existing, not bread) */}
        {isEditingExisting && editingLayerIndex > 0 && (
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

        {/* Remove Button (when editing existing, not bread) */}
        {isEditingExisting && editingLayerIndex > 0 && (
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
          {isAddingLayer ? 'Add' : 'Update'}
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
