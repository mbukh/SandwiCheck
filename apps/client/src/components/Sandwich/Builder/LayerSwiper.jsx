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
  const [selectedType, setSelectedType] = useState('');
  const swiperReference = useRef(null);
  const {
    editingLayerIndex: contextEditingLayerIndex,
    isAddingLayer: contextIsAddingLayer,
    sandwich,
    setCurrentIngredient,
  } = useSandwichContext();
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

  // Determine current type based on context
  const currentType = isAddingLayer
    ? selectedType
    : editingLayerIndex === null
      ? ''
      : sandwich.ingredients[editingLayerIndex]?.type;
  const ingredientsOfType = useMemo(() => allIngredients[currentType] || [], [allIngredients, currentType]);

  // Get the portion from the editing layer (if editing, not adding)
  const editingLayerPortion = useMemo(() => {
    if (!isAddingLayer && editingLayerIndex !== null) {
      return sandwich.ingredients[editingLayerIndex]?.portion;
    }
    return null;
  }, [isAddingLayer, editingLayerIndex, sandwich]);

  // Calculate initial slide index when editing (to avoid animation)
  const initialSlide = useMemo(() => {
    if (!isAddingLayer && editingLayerIndex !== null && ingredientsOfType.length > 0) {
      const editingIngredient = sandwich.ingredients[editingLayerIndex];
      if (editingIngredient) {
        const ingredientIndex = ingredientsOfType.findIndex((ing) => ing.id === editingIngredient.id);
        if (ingredientIndex !== -1) {
          // Add 1 because first slide is the "none" slide
          return ingredientIndex + 1;
        }
      }
    }
    return 0;
  }, [isAddingLayer, editingLayerIndex, sandwich, ingredientsOfType]);

  // Set current ingredient when slider initializes at correct position
  useEffect(() => {
    if (isVisible && !isAddingLayer && editingLayerIndex !== null && initialSlide > 0) {
      const ingredientIndex = initialSlide - 1; // Subtract 1 because first slide is "none"
      if (ingredientsOfType[ingredientIndex]) {
        setCurrentIngredient(ingredientsOfType[ingredientIndex]);
      }
    }
  }, [isVisible, isAddingLayer, editingLayerIndex, initialSlide, ingredientsOfType, setCurrentIngredient]);

  useEffect(() => {
    if (isAddingLayer && !selectedType && Object.keys(allIngredients).length > 0) {
      // Default to bread type when adding first layer (if no bread exists)
      const hasBread = sandwich.ingredients.some((ing) => ing.type === 'bread');
      if (hasBread) {
        // Default to first available type
        setSelectedType(Object.keys(allIngredients)[0]);
      } else {
        setSelectedType('bread');
      }
    }
  }, [isAddingLayer, selectedType, allIngredients, sandwich]);

  useEffect(() => {
    if (!isVisible) {
      setSelectedType('');
    }
  }, [isVisible]);

  const updateNavigationButtons = (activeIndex) => {
    const navUpdate = {
      0: { prev: true, next: true },
      1: { prev: false, next: true },
      2: { prev: true, next: false },
    };
    const start = +(activeIndex === 0) * 1;
    const end = +(activeIndex === ingredientsOfType.length) * 2;
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
            swiperReference.current.slideTo(0);
            setCurrentIngredient({});
          } catch {
            // Ignore errors
          }
        }
      });
    }

    // If editing a layer, ensure we're at the correct position without animation
    if (!isAddingLayer && editingLayerIndex !== null && initialSlide > 0) {
      // Use slideTo with speed 0 to set position immediately without animation
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
    setCurrentIngredient(ingredientsOfType[swiper.activeIndex - 1] || {});
    updateNavigationButtons(swiper.activeIndex);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentIngredient(null);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn('layer-slider min-h-0 w-full flex-1', className)}>
      {/* Integrated Type Selector - Only show when adding new layer */}
      {isAddingLayer && (
        <div className="mb-4 flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 rounded-lg bg-white p-4 shadow-lg">
            {Object.keys(allIngredients).map((type) => (
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

      {/* Ingredients Swiper */}
      {currentType && ingredientsOfType.length > 0 && (
        <div className="relative h-full">
          <Swiper
            key={`swiper-${editingLayerIndex}-${currentType}`}
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
            <SwiperSlide className="choice-null select-none">
              {({ isActive }) => (
                <SwiperSlideElementNone currentType={currentType} isActive={isActive} sandwich={sandwich} />
              )}
            </SwiperSlide>

            {ingredientsOfType.map((ingredient) => {
              // When editing a layer, use the portion from the editing layer for the slider images
              const ingredientWithPortion =
                editingLayerPortion && !isAddingLayer ? { ...ingredient, portion: editingLayerPortion } : ingredient;
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
