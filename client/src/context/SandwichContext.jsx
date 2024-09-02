import { createContext, useContext, useRef, useState, useEffect } from 'react';

import { log, logResponse } from '../utils/log';

import { DIETARY_PREFERENCES, TYPES } from '../constants/ingredients-constants';
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
    currentUser.dietaryPreferences && currentUser.dietaryPreferences.includes(DIETARY_PREFERENCES.kosher);

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
      setCurrentType(TYPES.bread);
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
