import { useState, useReducer, useCallback } from 'react';

import { logResponse } from '../utils/log';

import { TYPES } from '../constants/ingredients-constants';

import { EMPTY_SANDWICH } from '../constants/sandwich-constants';

import { fetchSandwichById } from '../services/api-sandwiches';

import sandwichReducer from '../reducers/sandwich-reducer';

const useSandwich = () => {
  const [currentType, setCurrentType] = useState(TYPES.bread);
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
