import { useCallback, useReducer, useState } from 'react';
import { TYPE } from '../constants/ingredients-constants';
import { EMPTY_SANDWICH } from '../constants/sandwich-constants';
import sandwichReducer, { SANDWICH_ACTION } from '../reducers/sandwich-reducer';
import { fetchSandwichById, readSandwichFromCache } from '../services/api-sandwiches';
import { ensureLayerInstanceIds } from '../utils/layer-instance-utils';
import { logResponse } from '../utils/log';

/**
 * Ensures a sandwich has layer instance IDs for all ingredients.
 * Used during initialization from cache to ensure proper layer management.
 * Also filters out unconfirmed layers that were added but never confirmed.
 */
const ensureSandwichLayerIds = (sandwich) => {
  if (!sandwich) return EMPTY_SANDWICH;
  // Filter out unconfirmed layers when loading from cache
  const confirmedIngredients = (sandwich.ingredients || []).filter((ing) => !ing.unconfirmed);
  return {
    ...sandwich,
    ingredients: ensureLayerInstanceIds(confirmedIngredients),
  };
};

const useSandwich = () => {
  const [currentType, setCurrentType] = useState(TYPE.bread);
  const [isSavingSandwich, setIsSavingSandwich] = useState(false);
  const initializeSandwich = () => {
    try {
      if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
        return EMPTY_SANDWICH;
      }

      const cachedSandwich = readSandwichFromCache();
      return ensureSandwichLayerIds(cachedSandwich || EMPTY_SANDWICH);
    } catch {
      return EMPTY_SANDWICH;
    }
  };

  const [sandwich, sandwichDispatch] = useReducer(sandwichReducer, EMPTY_SANDWICH, initializeSandwich);

  const getSandwich = useCallback(async (sandwichId) => {
    const res = await fetchSandwichById(sandwichId);
    logResponse('🥪 Read sandwich', res);

    if (res.success) {
      sandwichDispatch({
        type: SANDWICH_ACTION.UPDATE_SANDWICH,
        payload: res.data || EMPTY_SANDWICH,
      });
    }
  }, []);

  return {
    currentType,
    setCurrentType,
    sandwich,
    sandwichDispatch,
    isSavingSandwich,
    setIsSavingSandwich,
    getSandwich,
  };
};

export default useSandwich;
