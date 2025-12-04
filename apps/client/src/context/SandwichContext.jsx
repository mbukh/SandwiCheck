import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DIETARY_PREFERENCE, PORTION, PRODUCT, TYPE } from '../constants/ingredients-constants';
import { EMPTY_SANDWICH } from '../constants/sandwich-constants';
import { useAuthGlobalContext } from '../context/AuthGlobalContext';
import { useIngredientsGlobalContext } from '../context/IngredientsGlobalContext';
import useSandwich from '../hooks/use-sandwich';
import { createSandwich, deleteSandwichFromCache, updateSandwichInCache } from '../services/api-sandwiches';
import { logResponse } from '../utils/log';

const SandwichContext = createContext();

const SandwichContextProvider = ({ children }) => {
  const [currentIngredient, setCurrentIngredient] = useState({});
  const swiperContainerRef = useRef(null);
  const [editingLayerIndex, setEditingLayerIndex] = useState(null); // number | null
  const [isAddingLayer, setIsAddingLayer] = useState(false); // boolean
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
          type: 'UPDATE_INGREDIENTS',
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

  const clearSandwich = useCallback(() => {
    // Cancel any active layer editing before clearing
    setEditingLayerIndex(null);
    setIsAddingLayer(false);

    // Add random bread when clearing
    const breadOptions = ingredients[TYPE.bread] || [];
    let initialBread = null;
    if (breadOptions.length > 0) {
      const randomBread = breadOptions[Math.floor(Math.random() * breadOptions.length)];
      initialBread = { ...randomBread, portion: PORTION.full };
    }

    sandwichDispatch({
      type: 'UPDATE_SANDWICH',
      payload: initialBread ? { ...EMPTY_SANDWICH, ingredients: [initialBread] } : EMPTY_SANDWICH,
    });

    setCurrentType('');
    deleteSandwichFromCache();

    setTimeout(() => {
      setCurrentType(TYPE.bread);
    }, 400);
  }, [sandwichDispatch, setCurrentType, ingredients, setEditingLayerIndex, setIsAddingLayer]);

  const randomizeSandwich = () => {
    if (!areIngredientsReady || Object.keys(ingredients).length === 0) {
      return;
    }

    // Cancel any active layer editing before randomizing
    setEditingLayerIndex(null);
    setIsAddingLayer(false);

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
    sandwichDispatch({ type: 'UPDATE_SANDWICH', payload: { ...EMPTY_SANDWICH, ingredients: randomIngredients } });

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
        ingredients,
        areIngredientsReady,
        isCurrentUserReady,
        canGoNextType,
        goToNextType,
        defaultName,
        isSandwichReady,
        hasToBeKosher,
      }}
    >
      {children}
    </SandwichContext.Provider>
  );
};

export const useSandwichContext = () => useContext(SandwichContext);

export default SandwichContextProvider;
