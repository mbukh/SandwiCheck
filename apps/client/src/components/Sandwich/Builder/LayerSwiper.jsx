import 'swiper/css';
import 'swiper/css/a11y';
import '../../../styles/Swiper.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useIngredientsGlobalContext } from '../../../context/IngredientsGlobalContext';
import { useSandwichContext } from '../../../context/SandwichContext';
import { cn } from '../../../utils/cn';
import SwiperNavigationButton from '../SwiperNavigationButton';
import SwiperSlideElementNone from '../SwiperSlideElementNone';
import SwipeSlideElement from './SwipeSlideElement';

const LayerSwiper = ({
  isAddingLayer: propIsAddingLayer,
  editingLayerIndex: propEditingLayerIndex,
  onSwiperReady,
  className,
}) => {
  const [navigation, setNavigation] = useState({ prev: false, next: true });
  const swiperReference = useRef(null);
  const {
    editingLayerIndex: contextEditingLayerIndex,
    isAddingLayer: contextIsAddingLayer,
    sandwich,
    currentIngredient: contextCurrentIngredient,
    setCurrentIngredient,
    layerAddedViaAddTopRef,
    selectedType,
  } = useSandwichContext();
  const [addedLayerIndex, setAddedLayerIndex] = useState(null);
  const { ingredients: allIngredients } = useIngredientsGlobalContext();

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

  // Sync add-layer marker ref to state without reading refs during render.
  useEffect(() => {
    setAddedLayerIndex(layerAddedViaAddTopRef?.current ?? null);
  }, [layerAddedViaAddTopRef, editingLayerIndex, isAddingLayer]);

  /*
   * Treat unconfirmed layer being edited as "added layer" immediately,
   * and keep add-mode latched while exit animation runs.
   */
  const editingIngredient = editingLayerIndex === null ? null : sandwich.ingredients[editingLayerIndex];
  const isEditingAddedLayer =
    editingLayerIndex !== null && (Boolean(editingIngredient?.unconfirmed) || addedLayerIndex === editingLayerIndex);
  const isAddingNewLayer = isAddingLayer || isEditingAddedLayer;

  /*
   * Determine current type based on context
   * If editing a layer added via addTopLayer, allow type selection (use selectedType)
   */
  const currentType = isAddingNewLayer
    ? selectedType || sandwich.ingredients[editingLayerIndex]?.type
    : editingLayerIndex === null
      ? ''
      : sandwich.ingredients[editingLayerIndex]?.type;
  const ingredientsOfType = useMemo(() => allIngredients[currentType] || [], [allIngredients, currentType]);

  // Get the portion from the editing layer (if editing, not adding)
  const editingLayerPortion = useMemo(() => {
    if (!isAddingNewLayer && editingLayerIndex !== null) {
      return sandwich.ingredients[editingLayerIndex]?.portion;
    }
    return null;
  }, [isAddingNewLayer, editingLayerIndex, sandwich]);

  // Calculate initial slide index when editing or adding with pre-selected ingredient
  const initialSlide = useMemo(() => {
    const hasNoneSlide = !isAddingNewLayer;

    if (!isAddingNewLayer && editingLayerIndex !== null && ingredientsOfType.length > 0) {
      const editingIngredient = sandwich.ingredients[editingLayerIndex];
      if (editingIngredient) {
        const ingredientIndex = ingredientsOfType.findIndex((ing) => ing.id === editingIngredient.id);
        if (ingredientIndex !== -1) {
          // Add 1 if "none" slide exists, otherwise use ingredient index directly
          return hasNoneSlide ? ingredientIndex + 1 : ingredientIndex;
        }
      }
    }
    // When adding layer with pre-selected ingredient (e.g., from addTopLayer)
    if (isAddingNewLayer && contextCurrentIngredient?.id && ingredientsOfType.length > 0) {
      const ingredientIndex = ingredientsOfType.findIndex((ing) => ing.id === contextCurrentIngredient.id);
      if (ingredientIndex !== -1) {
        // Add 1 if "none" slide exists, otherwise use ingredient index directly
        return hasNoneSlide ? ingredientIndex + 1 : ingredientIndex;
      }
    }
    /*
     * When adding new layer without pre-selected ingredient, start at first ingredient (index 0, no "none" slide)
     * When editing existing layer, start at "none" slide (index 0)
     */
    return 0;
  }, [isAddingNewLayer, editingLayerIndex, sandwich, ingredientsOfType, contextCurrentIngredient]);

  // Set current ingredient when slider initializes at correct position
  useEffect(() => {
    const hasNoneSlide = !isAddingNewLayer;
    const noneSlideOffset = hasNoneSlide ? 1 : 0;
    const activeIndex = swiperReference.current?.activeIndex;

    /*
     * When editing an existing layer (not one just added via addTopLayer), sync currentIngredient from the layer.
     * When isEditingAddedLayer we must not overwrite: user's swiper choice is the source of truth.
     */
    if (isVisible && !isAddingLayer && !isEditingAddedLayer && editingLayerIndex !== null && initialSlide >= 0) {
      // If the user already moved the swiper, don't force-reset their selection.
      if (typeof activeIndex === 'number' && activeIndex !== initialSlide) {
        return;
      }
      if (initialSlide === 0 && hasNoneSlide) {
        // At "none" slide when editing existing layer
        setCurrentIngredient({});
      } else if (initialSlide > 0 || (initialSlide === 0 && !hasNoneSlide)) {
        // At an ingredient slide
        const ingredientIndex = initialSlide - noneSlideOffset;
        if (ingredientsOfType[ingredientIndex]) {
          setCurrentIngredient(ingredientsOfType[ingredientIndex]);
        }
      }
    }
    // When adding layer with pre-selected ingredient, ensure it's set correctly
    if (isVisible && (isAddingLayer || isEditingAddedLayer) && initialSlide >= 0 && contextCurrentIngredient?.id) {
      const ingredientIndex = initialSlide - noneSlideOffset;
      if (ingredientsOfType[ingredientIndex]?.id === contextCurrentIngredient.id) {
        // Ingredient is already set correctly, no need to update
        return;
      }
    }
    // When adding new layer without pre-selected ingredient, set first ingredient
    if (
      isVisible &&
      (isAddingLayer || isEditingAddedLayer) &&
      initialSlide === 0 &&
      !hasNoneSlide &&
      ingredientsOfType.length > 0 &&
      !contextCurrentIngredient?.id
    ) {
      setCurrentIngredient(ingredientsOfType[0]);
    }
  }, [
    isVisible,
    isAddingLayer,
    isEditingAddedLayer,
    isAddingNewLayer,
    editingLayerIndex,
    initialSlide,
    ingredientsOfType,
    setCurrentIngredient,
    contextCurrentIngredient,
    swiperReference,
  ]);

  const updateNavigationButtons = (activeIndex) => {
    const hasNoneSlide = !isAddingNewLayer;
    const totalSlides = ingredientsOfType.length + (hasNoneSlide ? 1 : 0);

    const navUpdate = {
      0: { prev: true, next: true },
      1: { prev: false, next: true },
      2: { prev: true, next: false },
    };
    const start = +(activeIndex === 0) * 1;
    const end = +(activeIndex === totalSlides - 1) * 2;
    setNavigation(navUpdate[start + end]);
  };

  const initSwiperHandler = (swiper) => {
    swiperReference.current = swiper;

    // Expose function to move to first slide if callback provided
    if (onSwiperReady) {
      onSwiperReady(() => {
        if (swiperReference.current) {
          try {
            /*
             * Use default animation speed for smooth transition
             * slideChange event will automatically update navigation buttons
             */
            const hasNoneSlide = !isAddingNewLayer;
            /*
             * When adding new layer, "first slide" is first ingredient (index 0), not "none"
             * When editing existing layer, "first slide" is "none" (index 0)
             */
            // Use default speed (undefined) for smooth animation, or 300ms for explicit smooth scroll
            swiperReference.current.slideTo(0, 300);
            if (hasNoneSlide) {
              setCurrentIngredient({});
            } else if (ingredientsOfType.length > 0) {
              setCurrentIngredient(ingredientsOfType[0]);
            }
          } catch {
            // Ignore errors
          }
        }
      });
    }

    // If editing a layer or adding with pre-selected ingredient, ensure we're at the correct position without animation
    if (initialSlide > 0 || (initialSlide === 0 && !(isAddingLayer || isEditingAddedLayer))) {
      /*
       * Use slideTo with speed 0 to set position immediately without animation
       * For adding new layer at index 0, swiper is already at correct position, but we still want to trigger slideChange
       */
      try {
        swiper.slideTo(initialSlide, 0);
      } catch {
        // Ignore errors
      }
    }

    // Update navigation buttons based on initial position
    if (initialSlide >= 0) {
      updateNavigationButtons(initialSlide);
    }
  };

  const slideChangeHandler = (swiper) => {
    const hasNoneSlide = !isAddingNewLayer;
    const noneSlideOffset = hasNoneSlide ? 1 : 0;
    setCurrentIngredient(ingredientsOfType[swiper.activeIndex - noneSlideOffset] || {});
    updateNavigationButtons(swiper.activeIndex);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn('layer-slider min-h-0 w-full flex-1', className)}>
      {/* Ingredients Swiper */}
      {currentType && ingredientsOfType.length > 0 && (
        <div className="relative h-full">
          <Swiper
            key={`swiper-${editingLayerIndex}-${currentType}-${isAddingNewLayer ? 'add' : 'edit'}`}
            spaceBetween={0}
            slidesPerView={1.5}
            centeredSlides={true}
            grabCursor={true}
            mousewheel={true}
            slideToClickedSlide={true}
            initialSlide={initialSlide}
            onSwiper={initSwiperHandler}
            onSlideChange={slideChangeHandler}
            onReachBeginning={() => setNavigation({ prev: false, next: true })}
            onReachEnd={() => setNavigation({ prev: true, next: false })}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 0,
              },
              360: {
                slidesPerView: 2,
                spaceBetween: 0,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 0,
              },
              1900: {
                slidesPerView: 4,
                spaceBetween: 100,
              },
            }}
          >
            {/* Hide "none" slide when adding a new layer */}
            {!isAddingNewLayer && (
              <SwiperSlide className="choice-null select-none">
                {({ isActive }) => (
                  <SwiperSlideElementNone currentType={currentType} isActive={isActive} sandwich={sandwich} />
                )}
              </SwiperSlide>
            )}

            {ingredientsOfType.map((ingredient) => {
              // When adding new layer, use currentIngredient.portion for preview; when editing, use editing layer portion
              const portion =
                isAddingNewLayer && contextCurrentIngredient?.portion
                  ? contextCurrentIngredient.portion
                  : editingLayerPortion && !isAddingNewLayer
                    ? editingLayerPortion
                    : ingredient.portion;
              const ingredientWithPortion = portion ? { ...ingredient, portion } : ingredient;
              return (
                <SwiperSlide key={ingredient.id} className="select-none">
                  <SwipeSlideElement ingredient={ingredientWithPortion} sandwich={sandwich} currentType={currentType} />
                </SwiperSlide>
              );
            })}

            <SwiperNavigationButton navigation={navigation} direction="previous" />
            <SwiperNavigationButton navigation={navigation} direction="next" />
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default LayerSwiper;
