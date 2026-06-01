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
  forceFetchIngredients: () => void;
}

const IngredientsGlobalContext = createContext<IngredientsGlobalContextValue | null>(null);

const IngredientsGlobalContextProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [ingredients, setIngredients] = useState<Record<string, Ingredient[]>>({});
  const [areIngredientsReady, setAreIngredientsReady] = useState(false);
  const [ingredientsRawList, setIngredientsRawList] = useState<Ingredient[]>([]);
  const { currentUser, isCurrentUserReady } = useAuthGlobalContext();

  const forceFetchIngredients = useCallback(() => {
    log('Forcing fetch ingredients');
    setAreIngredientsReady(false);
  }, []);

  useEffect(() => {
    if (areIngredientsReady || !isCurrentUserReady) {
      return;
    }

    void (async () => {
      const dietaryPreferences = currentUser.id ? currentUser.dietaryPreferences : [];

      const res = await getAllIngredients({ dietaryPreferences });

      setIngredients(groupIngredientsByTypes(res.data));
      setIngredientsRawList(res.data);

      setAreIngredientsReady(true);
    })();
  }, [areIngredientsReady, isCurrentUserReady, currentUser]);

  return (
    <IngredientsGlobalContext.Provider
      value={{
        ingredients,
        ingredientsRawList,
        areIngredientsReady,
        forceFetchIngredients,
      }}
    >
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
