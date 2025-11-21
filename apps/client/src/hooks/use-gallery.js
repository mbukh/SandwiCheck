import { useState, useCallback } from 'react';

import { logResponse } from '../utils/log';

import * as apiSandwiches from '../services/api-sandwiches';
import * as apiUsers from '../services/api-users';

const useGallery = () => {
  const [gallerySandwiches, setGallerySandwiches] = useState([]);

  const fetchSandwiches = useCallback(
    async ({
      dietaryPreferences = [],
      ingredients = [],
      sortBy = 'createdAt', // votesCount || votes
      page = 1,
      limit = 48,
    }) => {
      const res = await apiSandwiches.fetchSandwiches({
        dietaryPreferences,
        ingredients,
        sortBy,
        page,
        limit,
      });
      logResponse('🥪 Read sandwiches', res);

      setGallerySandwiches(res.data || []);
    },
    [],
  );

  const fetchUserSandwiches = useCallback(async (id, sortByCreatedAt = false) => {
    const res = await apiUsers.fetchUserById(id);
    logResponse('🍔👽 Fetch user with sandwiches', res);

    if (res.data && res.data.sandwiches) {
      let sandwiches = res.data.sandwiches;
      // Sort by createdAt (newest first) if requested (for personal menu)
      if (sortByCreatedAt) {
        sandwiches = [...sandwiches].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Descending order (newest first)
        });
      }
      setGallerySandwiches(sandwiches);
    }
  }, []);

  return {
    gallerySandwiches,
    setGallerySandwiches,
    fetchUserSandwiches,
    fetchSandwiches,
  };
};

export default useGallery;
