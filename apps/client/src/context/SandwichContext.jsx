import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DIETARY_PREFERENCE, getNextIngredientType, PORTION, PRODUCT, TYPE } from '../constants/ingredients-constants';
import { EMPTY_SANDWICH, MAX_INGREDIENTS_COUNT } from '../constants/sandwich-constants';
import { useAuthGlobalContext } from '../context/AuthGlobalContext';
import { useIngredientsGlobalContext } from '../context/IngredientsGlobalContext';
import useSandwich from '../hooks/use-sandwich';
import { SANDWICH_ACTION } from '../reducers/sandwich-reducer';
import { createSandwich, deleteSandwichFromCache, updateSandwichInCache } from '../services/api-sandwiches';
import { withLayerInstanceId } from '../utils/layer-instance-utils';
import { logResponse } from '../utils/log';
import { doesStayKosherWithIngredient } from '../utils/sandwich-utils';

const SandwichContext = createContext();

const SandwichContextProvider = ({ children }) => {
  const [currentIngredient, setCurrentIngredient] = useState({});
  const swiperContainerRef = useRef(null);
  const [editingLayerIndex, setEditingLayerIndex] = useState(null); // number | null
  const [isAddingLayer, setIsAddingLayer] = useState(false); // boolean
  const [selectedType, setSelectedType] = useState(''); // string - for type selection when adding layer
  const editingSnapshotRef = useRef(null);
  const layerAddedViaAddTopRef = useRef(null);
  const { ingredients, areIngredientsReady, forceFetchIngredients } = useIngredientsGlobalContext();
  const { currentUser, setCurrentUser, isCurrentUserReady } = useAuthGlobalContext();
  const {
    currentType,
    setCurrentType,
    sandwich,
    sandwichDispatch,
    isSavingSandwich,
    setIsSavingSandwich,
    gallerySandwiches,
    setGallerySandwiches,
    getSandwich,
  } = useSandwich();

  const defaultName = currentUser.firstName + "'s Sandwich";
  const isSandwichReady = sandwich.ingredients.length > 1;
  const hasToBeKosher =
    currentUser.dietaryPreferences && currentUser.dietaryPreferences.includes(DIETARY_PREFERENCE.kosher);

  const canGoNextType = Object.keys(ingredients).indexOf(currentType) < Object.keys(ingredients).length - 1;

  const goToNextType = () => {
    const types = Object.keys(ingredients);
    const currentIndex = types.indexOf(currentType);
    if (currentIndex < types.length - 1) {
      setCurrentType(types[currentIndex + 1]);
    }
  };

  useEffect(() => {
    forceFetchIngredients();
  }, [forceFetchIngredients]);

  // Initialize with random bread when sandwich is empty and ingredients are ready
  useEffect(() => {
    if (!areIngredientsReady || !ingredients[TYPE.bread] || ingredients[TYPE.bread].length === 0) {
      return;
    }

    const isEmptySandwich =
      sandwich.ingredients.length === 0 && (!sandwich.name || sandwich.name.trim() === '') && !sandwich.comment;

    if (isEmptySandwich) {
      // Add random bread only if sandwich is truly empty
      const breadOptions = ingredients[TYPE.bread] || [];
      if (breadOptions.length > 0) {
        const randomBread = breadOptions[Math.floor(Math.random() * breadOptions.length)];
        sandwichDispatch({
          type: SANDWICH_ACTION.UPDATE_INGREDIENTS,
          payload: [{ ...randomBread, portion: PORTION.full }],
        });
      }
      deleteSandwichFromCache();
      return;
    }

    // Update cache for non-empty sandwiches
    const hasBread = sandwich.ingredients.some((ing) => ing.type === TYPE.bread);
    if (hasBread || sandwich.ingredients.length > 0 || sandwich.name || sandwich.comment) {
      updateSandwichInCache(sandwich);
    }
  }, [sandwich, areIngredientsReady, ingredients, sandwichDispatch]);

  const resetEditingState = useCallback(
    (revertChanges = false) => {
      if (revertChanges && editingSnapshotRef.current) {
        sandwichDispatch({ type: SANDWICH_ACTION.UPDATE_SANDWICH, payload: editingSnapshotRef.current });
      }
      editingSnapshotRef.current = null;
      setEditingLayerIndex(null);
      setIsAddingLayer(false);
      setCurrentIngredient({});
      setSelectedType('');
      // Clear the addTopLayer flag when resetting editing state
      layerAddedViaAddTopRef.current = null;
    },
    [sandwichDispatch, setCurrentIngredient, setSelectedType],
  );

  const startEditingLayer = useCallback(
    (index, ingredientOverride = null) => {
      /*
       * If we switch layers while an edit session is active, revert the previous
       * unsaved changes before starting a new session.
       */
      if (editingLayerIndex !== null && editingLayerIndex !== index && editingSnapshotRef.current) {
        sandwichDispatch({ type: SANDWICH_ACTION.UPDATE_SANDWICH, payload: editingSnapshotRef.current });
        editingSnapshotRef.current = null;
      }

      if (!editingSnapshotRef.current) {
        editingSnapshotRef.current = sandwich;
      }

      setEditingLayerIndex(index);
      setIsAddingLayer(false);
      setCurrentIngredient(ingredientOverride || sandwich.ingredients[index] || {});
    },
    [editingLayerIndex, sandwich, sandwichDispatch, setCurrentIngredient, setEditingLayerIndex, setIsAddingLayer],
  );

  const clearSandwich = useCallback(() => {
    // Cancel any active layer editing before clearing
    resetEditingState(true);

    // Add random bread when clearing
    const breadOptions = ingredients[TYPE.bread] || [];
    let initialBread = null;
    if (breadOptions.length > 0) {
      const randomBread = breadOptions[Math.floor(Math.random() * breadOptions.length)];
      initialBread = { ...randomBread, portion: PORTION.full };
    }

    sandwichDispatch({
      type: SANDWICH_ACTION.UPDATE_SANDWICH,
      payload: initialBread
        ? { ...EMPTY_SANDWICH, ingredients: [initialBread], forceNewIds: true }
        : { ...EMPTY_SANDWICH, forceNewIds: true },
    });

    setCurrentType('');
    deleteSandwichFromCache();

    setTimeout(() => {
      setCurrentType(TYPE.bread);
    }, 400);
  }, [ingredients, resetEditingState, sandwichDispatch, setCurrentType]);

  const randomizeSandwich = () => {
    if (!areIngredientsReady || Object.keys(ingredients).length === 0) {
      return;
    }

    // Cancel any active layer editing before randomizing
    resetEditingState(true);

    const randomIngredients = [];
    let hasMeat = false;
    let hasDairy = false;

    // Helper function to get a random item from an array
    const getRandomItem = (array) => {
      if (!array || array.length === 0) return null;
      return array[Math.floor(Math.random() * array.length)];
    };

    // Helper function to get a random portion
    const getRandomPortion = () => {
      const portions = Object.values(PORTION);
      return portions[Math.floor(Math.random() * portions.length)];
    };

    // Helper function to check if ingredient conflicts with kosher rules
    const isKosherCompatible = (ingredient) => {
      if (!hasToBeKosher || !ingredient.dietaryPreferences) return true;

      const isMeat = ingredient.dietaryPreferences.includes(PRODUCT.meat);
      const isDairy = ingredient.dietaryPreferences.includes(PRODUCT.dairy);

      if ((hasMeat && isDairy) || (hasDairy && isMeat)) {
        return false;
      }

      return true;
    };

    /*
     * Always include bread (required)
     * Note: Ingredients are already filtered by dietary preferences in IngredientsGlobalContext
     * So all available ingredients already match user's dietary preferences (kosher, halal, vegetarian, vegan, etc.)
     */
    const breadOptions = ingredients[TYPE.bread] || [];
    if (breadOptions.length > 0) {
      const randomBread = getRandomItem(breadOptions);
      if (randomBread) {
        randomIngredients.push({ ...randomBread, portion: getRandomPortion() });
      }
    }

    // Randomly select from other types
    const otherTypes = [TYPE.protein, TYPE.cheese, TYPE.toppings, TYPE.condiments];

    for (const type of otherTypes) {
      const typeIngredients = ingredients[type] || [];
      if (typeIngredients.length === 0) continue;

      /*
       * Filter compatible ingredients for kosher rules (meat/dairy mixing)
       * Note: Ingredients are already filtered by dietary preferences, but we still need to check
       * kosher meat/dairy mixing rules since individual kosher ingredients can still conflict when combined
       */
      const compatibleIngredients = hasToBeKosher ? typeIngredients.filter(isKosherCompatible) : typeIngredients;

      // If no compatible ingredients, skip this type
      if (compatibleIngredients.length === 0) continue;

      // Randomly decide whether to include this type (70% chance for non-required types)
      if (Math.random() < 0.7 || type === TYPE.protein) {
        const randomIngredient = getRandomItem(compatibleIngredients);
        if (randomIngredient) {
          randomIngredients.push({ ...randomIngredient, portion: getRandomPortion() });

          // Update kosher tracking for meat/dairy mixing rules
          if (randomIngredient.dietaryPreferences) {
            if (randomIngredient.dietaryPreferences.includes(PRODUCT.meat)) hasMeat = true;
            if (randomIngredient.dietaryPreferences.includes(PRODUCT.dairy)) hasDairy = true;
          }
        }
      }
    }

    // Clear and set the random sandwich
    sandwichDispatch({
      type: SANDWICH_ACTION.UPDATE_SANDWICH,
      payload: { ...EMPTY_SANDWICH, ingredients: randomIngredients, forceNewIds: true },
    });

    setCurrentType('');

    setTimeout(() => {
      setCurrentType(TYPE.bread);
    }, 400);
  };

  const saveSandwich = useCallback(
    async (sandwichToSave) => {
      setIsSavingSandwich(true);

      try {
        const res = await createSandwich(sandwichToSave);
        logResponse('👽 🥪 Create sandwich', res);

        if (res.success) {
          setCurrentUser((previousUser) => {
            if (!previousUser?.id || !res.data) {
              return previousUser;
            }

            const existingSandwiches = previousUser.sandwiches || [];
            const alreadyIncluded = existingSandwiches.some((item) => item.id === res.data.id);

            return {
              ...previousUser,
              sandwiches: alreadyIncluded ? existingSandwiches : [...existingSandwiches, res.data],
            };
          });

          deleteSandwichFromCache();
        }

        return res;
      } finally {
        setIsSavingSandwich(false);
      }
    },
    [setCurrentUser, setIsSavingSandwich],
  );

  const startAddingLayer = useCallback(() => {
    const { ingredients: sandwichIngredients } = sandwich;
    if (sandwichIngredients.length === 0 || sandwichIngredients.length >= MAX_INGREDIENTS_COUNT) {
      return;
    }
    const topLayer = sandwichIngredients.at(-1);
    if (!topLayer) {
      return;
    }

    /*
     * Pick the next available type in the add order relative to the current top layer.
     * If a type has no options, move forward until a type with options is found.
     */
    let nextType = getNextIngredientType(topLayer.type);
    const visitedTypes = new Set();
    let pool = [];

    while (!visitedTypes.has(nextType)) {
      visitedTypes.add(nextType);

      const list = ingredients[nextType] || [];
      if (list.length > 0) {
        const kosherList = hasToBeKosher ? list.filter((ing) => doesStayKosherWithIngredient(ing, sandwich)) : list;
        pool = kosherList.length > 0 ? kosherList : list;
        if (pool.length > 0) {
          break;
        }
      }

      if (nextType === TYPE.condiments) {
        break;
      }
      nextType = getNextIngredientType(nextType);
    }

    if (pool.length === 0) {
      return;
    }

    const randomIngredient = pool[Math.floor(Math.random() * pool.length)];

    if (!randomIngredient) {
      return;
    }

    // Use the same unconfirmed-layer flow as addTopLayer so preview stays in final stack position.
    const addedLayer = withLayerInstanceId(
      {
        ...randomIngredient,
        portion: PORTION.full,
        unconfirmed: true,
      },
      true,
    );
    const updatedIngredients = [...sandwichIngredients, addedLayer];
    const newLayerIndex = updatedIngredients.length - 1;

    layerAddedViaAddTopRef.current = newLayerIndex;
    sandwichDispatch({ type: SANDWICH_ACTION.UPDATE_INGREDIENTS, payload: updatedIngredients });
    setSelectedType(nextType);
    setTimeout(() => {
      startEditingLayer(newLayerIndex, addedLayer);
    }, 0);
  }, [
    sandwich,
    ingredients,
    hasToBeKosher,
    setSelectedType,
    sandwichDispatch,
    startEditingLayer,
    layerAddedViaAddTopRef,
  ]);

  const addTopLayer = useCallback(() => {
    startAddingLayer();
  }, [startAddingLayer]);

  return (
    <SandwichContext.Provider
      value={{
        currentType,
        setCurrentType,
        sandwich,
        sandwichDispatch,
        isSavingSandwich,
        setIsSavingSandwich,
        gallerySandwiches,
        setGallerySandwiches,
        getSandwich,
        clearSandwich,
        randomizeSandwich,
        saveSandwich,
        currentIngredient,
        setCurrentIngredient,
        swiperContainerRef,
        editingLayerIndex,
        setEditingLayerIndex,
        isAddingLayer,
        setIsAddingLayer,
        selectedType,
        setSelectedType,
        ingredients,
        areIngredientsReady,
        isCurrentUserReady,
        canGoNextType,
        goToNextType,
        defaultName,
        isSandwichReady,
        hasToBeKosher,
        startEditingLayer,
        resetEditingState,
        addTopLayer,
        startAddingLayer,
        layerAddedViaAddTopRef,
      }}
    >
      {children}
    </SandwichContext.Provider>
  );
};

export const useSandwichContext = () => useContext(SandwichContext);

export default SandwichContextProvider;
