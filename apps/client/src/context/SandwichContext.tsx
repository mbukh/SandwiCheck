import {
  createContext,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DIETARY_PREFERENCE, MAX_INGREDIENTS_COUNT, PORTION, PRODUCT, TYPE } from '@sandwicheck/shared';
import { getNextIngredientType } from '@/constants/ingredients-constants';
import { EMPTY_SANDWICH } from '@/constants/sandwich-constants';
import useSandwich from '@/hooks/use-sandwich';
import { SANDWICH_ACTION, type SandwichAction } from '@/reducers/sandwich-reducer';
import { createSandwich, deleteSandwichFromCache, updateSandwichInCache } from '@/services/api-sandwiches';
import type { ApiResult } from '@/types/api';
import type { BuilderSandwich, Ingredient, Sandwich, SandwichLayer } from '@/types/domain';
import { withLayerInstanceId } from '@/utils/layer-instance-utils';
import { logResponse } from '@/utils/log';
import { buildDefaultSandwichName, doesStayKosherWithIngredient } from '@/utils/sandwich-utils';
import { useAuthGlobalContext } from './AuthGlobalContext.tsx';
import { useIngredientsGlobalContext } from './IngredientsGlobalContext.tsx';

interface SandwichContextValue {
  currentType: string;
  setCurrentType: Dispatch<SetStateAction<string>>;
  sandwich: BuilderSandwich;
  sandwichDispatch: Dispatch<SandwichAction>;
  isSavingSandwich: boolean;
  setIsSavingSandwich: Dispatch<SetStateAction<boolean>>;
  clearSandwich: () => void;
  randomizeSandwich: () => void;
  saveSandwich: (sandwichToSave: BuilderSandwich) => Promise<ApiResult<Sandwich>>;
  currentIngredient: Partial<SandwichLayer>;
  setCurrentIngredient: Dispatch<SetStateAction<Partial<SandwichLayer>>>;
  swiperContainerRef: RefObject<HTMLDivElement | null>;
  editingLayerIndex: number | null;
  setEditingLayerIndex: Dispatch<SetStateAction<number | null>>;
  isAddingLayer: boolean;
  setIsAddingLayer: Dispatch<SetStateAction<boolean>>;
  selectedType: string;
  setSelectedType: Dispatch<SetStateAction<string>>;
  ingredients: Record<string, Ingredient[]>;
  areIngredientsReady: boolean;
  isCurrentUserReady: boolean;
  canGoNextType: boolean;
  goToNextType: () => void;
  defaultName: string;
  isSandwichReady: boolean;
  hasToBeKosher: boolean;
  startEditingLayer: (index: number, ingredientOverride?: SandwichLayer | null) => void;
  resetEditingState: (revertChanges?: boolean) => void;
  addTopLayer: () => void;
  startAddingLayer: () => void;
  layerAddedViaAddTopRef: RefObject<number | null>;
}

const SandwichContext = createContext<SandwichContextValue | null>(null);

const SandwichContextProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [currentIngredient, setCurrentIngredient] = useState<Partial<SandwichLayer>>({});
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const [editingLayerIndex, setEditingLayerIndex] = useState<number | null>(null);
  const [isAddingLayer, setIsAddingLayer] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const editingSnapshotRef = useRef<BuilderSandwich | null>(null);
  const layerAddedViaAddTopRef = useRef<number | null>(null);
  const { ingredients, areIngredientsReady, forceFetchIngredients } = useIngredientsGlobalContext();
  const { currentUser, setCurrentUser, isCurrentUserReady } = useAuthGlobalContext();
  const { currentType, setCurrentType, sandwich, sandwichDispatch, isSavingSandwich, setIsSavingSandwich } =
    useSandwich();

  const defaultName = buildDefaultSandwichName(currentUser.firstName);
  const isSandwichReady = sandwich.ingredients.length > 1;
  const hasToBeKosher = Boolean(currentUser.dietaryPreferences?.includes(DIETARY_PREFERENCE.kosher));

  const canGoNextType = Object.keys(ingredients).indexOf(currentType) < Object.keys(ingredients).length - 1;

  const goToNextType = (): void => {
    const types = Object.keys(ingredients);
    const currentIndex = types.indexOf(currentType);
    const next = types[currentIndex + 1];
    if (currentIndex < types.length - 1 && next !== undefined) {
      setCurrentType(next);
    }
  };

  useEffect(() => {
    forceFetchIngredients();
  }, [forceFetchIngredients]);

  // Initialize with random bread when sandwich is empty and ingredients are ready
  useEffect(() => {
    const breadOptions = ingredients[TYPE.bread];
    if (!areIngredientsReady || !breadOptions || breadOptions.length === 0) {
      return;
    }

    const isEmptySandwich =
      sandwich.ingredients.length === 0 && (!sandwich.name || sandwich.name.trim() === '') && !sandwich.comment;

    if (isEmptySandwich) {
      // Add random bread only if sandwich is truly empty
      const randomBread = breadOptions[Math.floor(Math.random() * breadOptions.length)];
      if (randomBread) {
        sandwichDispatch({
          type: SANDWICH_ACTION.UPDATE_INGREDIENTS,
          payload: [{ ...randomBread, portion: PORTION.full }],
        });
      }
      deleteSandwichFromCache();
      return;
    }

    // Update cache for non-empty sandwiches
    const hasBread = sandwich.ingredients.some((ingredient) => ingredient.type === TYPE.bread);
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
    (index: number, ingredientOverride: SandwichLayer | null = null) => {
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
    let initialBread: SandwichLayer | null = null;
    if (breadOptions.length > 0) {
      const randomBread = breadOptions[Math.floor(Math.random() * breadOptions.length)];
      if (randomBread) {
        initialBread = { ...randomBread, portion: PORTION.full };
      }
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

  const randomizeSandwich = (): void => {
    if (!areIngredientsReady || Object.keys(ingredients).length === 0) {
      return;
    }

    // Cancel any active layer editing before randomizing
    resetEditingState(true);

    const randomIngredients: SandwichLayer[] = [];
    let hasMeat = false;
    let hasDairy = false;

    // Helper function to get a random item from an array
    const getRandomItem = (array: Ingredient[]): Ingredient | null => {
      if (!array || array.length === 0) return null;
      return array[Math.floor(Math.random() * array.length)] ?? null;
    };

    // Helper function to get a random portion
    const getRandomPortion = (): (typeof PORTION)[keyof typeof PORTION] => {
      const portions = Object.values(PORTION);
      return portions[Math.floor(Math.random() * portions.length)] ?? PORTION.full;
    };

    // Helper function to check if ingredient conflicts with kosher rules
    const isKosherCompatible = (ingredient: Ingredient): boolean => {
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
    async (sandwichToSave: BuilderSandwich): Promise<ApiResult<Sandwich>> => {
      setIsSavingSandwich(true);

      try {
        const res = await createSandwich(sandwichToSave);
        logResponse('👽 🥪 Create sandwich', res);

        if (res.success) {
          setCurrentUser((previousUser) => {
            const created = res.data;
            if (!previousUser?.id || !created) {
              return previousUser;
            }

            const existingSandwiches = previousUser.sandwiches || [];
            const alreadyIncluded = existingSandwiches.some(
              (item) => typeof item !== 'string' && item.id === created.id,
            );

            return {
              ...previousUser,
              sandwiches: alreadyIncluded ? existingSandwiches : [...existingSandwiches, created],
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
    const visitedTypes = new Set<string>();
    let pool: Ingredient[] = [];

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
  }, [sandwich, ingredients, hasToBeKosher, setSelectedType, sandwichDispatch, startEditingLayer]);

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

export const useSandwichContext = (): SandwichContextValue => {
  const context = useContext(SandwichContext);
  if (!context) {
    throw new Error('useSandwichContext must be used within a SandwichContextProvider');
  }
  return context;
};

export default SandwichContextProvider;
