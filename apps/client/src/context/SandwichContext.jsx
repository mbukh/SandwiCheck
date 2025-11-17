import { createContext, useContext, useRef, useState, useEffect } from 'react';

import { log, logResponse } from '../utils/log';

import { DIETARY_PREFERENCE, TYPE, DEFAULT_PORTION, PORTION, PRODUCT } from '../constants/ingredients-constants';
import { EMPTY_SANDWICH } from '../constants/sandwich-constants';

import {
  deleteSandwichFromCache,
  readSandwichFromCache,
  updateSandwichInCache,
  createSandwich,
} from '../services/api-sandwiches';

import { useIngredientsGlobalContext } from '../context/IngredientsGlobalContext';
import { useAuthGlobalContext } from '../context/AuthGlobalContext';

import useSandwich from '../hooks/use-sandwich';

const SandwichContext = createContext();

const SandwichContextProvider = ({ children }) => {
  const [currentIngredient, setCurrentIngredient] = useState({});
  const swiperContainerRef = useRef(null);
  const { ingredients, areIngredientsReady, forceFetchIngredients } = useIngredientsGlobalContext();
  const { currentUser, isCurrentUserReady } = useAuthGlobalContext();
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

    const sandwichFromCache = readSandwichFromCache();
    log('Sandwich retrieved from cache', sandwichFromCache);

    if (sandwichFromCache) {
      sandwichDispatch({ type: 'UPDATE_SANDWICH', payload: sandwichFromCache });
    }
  }, [forceFetchIngredients, isSavingSandwich, sandwichDispatch]);

  useEffect(() => {
    updateSandwichInCache(sandwich);
  }, [sandwich]);

  const clearSandwich = () => {
    sandwichDispatch({ type: 'UPDATE_SANDWICH', payload: EMPTY_SANDWICH });

    setCurrentType('');
    deleteSandwichFromCache();

    setTimeout(() => {
      setCurrentType(TYPE.bread);
    }, 400);
  };

  const randomizeSandwich = () => {
    if (!areIngredientsReady || Object.keys(ingredients).length === 0) {
      return;
    }

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

    // Always include bread (required)
    // Note: Ingredients are already filtered by dietary preferences in IngredientsGlobalContext
    // So all available ingredients already match user's dietary preferences (kosher, halal, vegetarian, vegan, etc.)
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

      // Filter compatible ingredients for kosher rules (meat/dairy mixing)
      // Note: Ingredients are already filtered by dietary preferences, but we still need to check
      // kosher meat/dairy mixing rules since individual kosher ingredients can still conflict when combined
      const compatibleIngredients = hasToBeKosher
        ? typeIngredients.filter(isKosherCompatible)
        : typeIngredients;

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
    deleteSandwichFromCache();

    setTimeout(() => {
      setCurrentType(TYPE.bread);
    }, 400);
  };

  const saveSandwich = async (sandwich) => {
    setIsSavingSandwich(true);

    const res = await createSandwich(sandwich);
    logResponse('👽 🥪 Create sandwich', res);
    if (res.success) {
      clearSandwich();
    }

    setIsSavingSandwich(false);
    return res;
  };

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
