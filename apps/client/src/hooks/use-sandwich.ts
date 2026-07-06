import { type Dispatch, type SetStateAction, useReducer, useState } from 'react';
import { TYPE } from '@sandwicheck/shared';
import { EMPTY_SANDWICH } from '@/constants/sandwich-constants';
import sandwichReducer, { type SandwichAction } from '@/reducers/sandwich-reducer';
import { readSandwichFromCache } from '@/services/api-sandwiches';
import type { BuilderSandwich } from '@/types/domain';
import { ensureLayerInstanceIds } from '@/utils/layer-instance-utils';

interface UseSandwichResult {
  currentType: string;
  setCurrentType: Dispatch<SetStateAction<string>>;
  sandwich: BuilderSandwich;
  sandwichDispatch: Dispatch<SandwichAction>;
  isSavingSandwich: boolean;
  setIsSavingSandwich: Dispatch<SetStateAction<boolean>>;
}

/**
 * Ensures a sandwich has layer instance IDs for all ingredients.
 * Used during initialization from cache; also filters out unconfirmed layers.
 */
const ensureSandwichLayerIds = (sandwich: BuilderSandwich | null): BuilderSandwich => {
  if (!sandwich) return EMPTY_SANDWICH;
  // Filter out unconfirmed layers when loading from cache
  const confirmedIngredients = (sandwich.ingredients || []).filter((ingredient) => !ingredient.unconfirmed);
  return {
    ...sandwich,
    ingredients: ensureLayerInstanceIds(confirmedIngredients),
  };
};

const useSandwich = (): UseSandwichResult => {
  const [currentType, setCurrentType] = useState<string>(TYPE.bread);
  const [isSavingSandwich, setIsSavingSandwich] = useState(false);

  const initializeSandwich = (): BuilderSandwich => {
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

  return {
    currentType,
    setCurrentType,
    sandwich,
    sandwichDispatch,
    isSavingSandwich,
    setIsSavingSandwich,
  };
};

export default useSandwich;
