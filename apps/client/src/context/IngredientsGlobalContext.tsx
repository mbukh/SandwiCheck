import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getAllIngredients } from '@/services/api-ingredients';
import type { Ingredient } from '@/types/domain';
import { groupIngredientsByTypes } from '@/utils/ingredients-utils';
import { log } from '@/utils/log';
import { useAuthGlobalContext } from './AuthGlobalContext.tsx';

interface IngredientsGlobalContextValue {
  ingredients: Record<string, Ingredient[]>;
  ingredientsRawList: Ingredient[];
  areIngredientsReady: boolean;
  /** True when the ingredient load failed; the app shows a retry banner instead of an eternal loader. */
  ingredientsLoadFailed: boolean;
  forceFetchIngredients: () => void;
  retryLoadIngredients: () => void;
}

const IngredientsGlobalContext = createContext<IngredientsGlobalContextValue | null>(null);

const IngredientsGlobalContextProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [ingredients, setIngredients] = useState<Record<string, Ingredient[]>>({});
  const [areIngredientsReady, setAreIngredientsReady] = useState(false);
  const [ingredientsRawList, setIngredientsRawList] = useState<Ingredient[]>([]);
  const [ingredientsLoadFailed, setIngredientsLoadFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { currentUser, isCurrentUserReady } = useAuthGlobalContext();

  const forceFetchIngredients = useCallback(() => {
    log('Forcing fetch ingredients');
    setAreIngredientsReady(false);
  }, []);

  const retryLoadIngredients = useCallback(() => {
    // areIngredientsReady is already false after a failure, so bump a counter to re-run the effect.
    setIngredientsLoadFailed(false);
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (areIngredientsReady || !isCurrentUserReady) {
      return;
    }

    void (async () => {
      try {
        const dietaryPreferences = currentUser.id ? currentUser.dietaryPreferences : [];

        const res = await getAllIngredients({ dietaryPreferences });

        if (res.error) {
          /*
           * A real failure: keep areIngredientsReady false and let the retry banner take over,
           * instead of marking ready with an empty catalog (which dead-ends the builder).
           */
          log('Failed to load ingredients', res.error);
          setIngredientsLoadFailed(true);
          return;
        }

        setIngredients(groupIngredientsByTypes(res.data));
        setIngredientsRawList(res.data);
        setIngredientsLoadFailed(false);
        setAreIngredientsReady(true);
      } catch (error) {
        // A thrown hydration error must surface as a retryable failure, not a silent eternal loader.
        log('Failed to load ingredients', error);
        setIngredientsLoadFailed(true);
      }
    })();
  }, [areIngredientsReady, isCurrentUserReady, currentUser, retryCount]);

  return (
    <IngredientsGlobalContext.Provider
      value={{
        ingredients,
        ingredientsRawList,
        areIngredientsReady,
        ingredientsLoadFailed,
        forceFetchIngredients,
        retryLoadIngredients,
      }}
    >
      {ingredientsLoadFailed && (
        <div className="fixed inset-x-0 top-0 z-[100] flex flex-wrap items-center justify-center gap-3 bg-magenta px-4 py-2 text-center text-sm text-white">
          <span>We couldn&apos;t load the ingredients.</span>
          <button
            type="button"
            onClick={retryLoadIngredients}
            className="rounded bg-white/20 px-3 py-1 font-bold uppercase transition-colors hover:bg-white/30"
          >
            Retry
          </button>
        </div>
      )}
      {children}
    </IngredientsGlobalContext.Provider>
  );
};

export const useIngredientsGlobalContext = (): IngredientsGlobalContextValue => {
  const context = useContext(IngredientsGlobalContext);
  if (!context) {
    throw new Error('useIngredientsGlobalContext must be used within an IngredientsGlobalContextProvider');
  }
  return context;
};

export default IngredientsGlobalContextProvider;
