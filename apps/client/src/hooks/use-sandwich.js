import { useCallback, useReducer, useState } from 'react';
import { TYPE } from '../constants/ingredients-constants';
import { EMPTY_SANDWICH } from '../constants/sandwich-constants';
import sandwichReducer from '../reducers/sandwich-reducer';
import { fetchSandwichById } from '../services/api-sandwiches';
import { logResponse } from '../utils/log';

const useSandwich = () => {
  const [currentType, setCurrentType] = useState(TYPE.bread);
  const [isSavingSandwich, setIsSavingSandwich] = useState(false);
  const [sandwich, sandwichDispatch] = useReducer(sandwichReducer, EMPTY_SANDWICH);

  const getSandwich = useCallback(async (sandwichId) => {
    const res = await fetchSandwichById(sandwichId);
    logResponse('🥪 Read sandwich', res);

    if (res.success) {
      sandwichDispatch({
        type: 'UPDATE_SANDWICH',
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
