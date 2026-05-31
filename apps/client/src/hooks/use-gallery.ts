import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';
import type { SandwichQuery } from '@/services/api-sandwiches';
import * as apiSandwiches from '@/services/api-sandwiches';
import * as apiUsers from '@/services/api-users';
import type { Sandwich } from '@/types/domain';
import { logResponse } from '@/utils/log';

interface UseGalleryResult {
  gallerySandwiches: Sandwich[];
  setGallerySandwiches: Dispatch<SetStateAction<Sandwich[]>>;
  fetchUserSandwiches: (id: string, sortByCreatedAt?: boolean) => Promise<void>;
  fetchSandwiches: (query: SandwichQuery) => Promise<void>;
}

const useGallery = (): UseGalleryResult => {
  const [gallerySandwiches, setGallerySandwiches] = useState<Sandwich[]>([]);

  const fetchSandwiches = useCallback(
    async ({
      dietaryPreferences = [],
      ingredients = [],
      sortBy = 'createdAt', // votesCount || votes
      page = 1,
      limit = 48,
    }: SandwichQuery): Promise<void> => {
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

  const fetchUserSandwiches = useCallback(async (id: string, sortByCreatedAt = false): Promise<void> => {
    const res = await apiUsers.fetchUserById(id);
    logResponse('🍔👽 Fetch user with sandwiches', res);

    if (res.data && res.data.sandwiches) {
      let sandwiches = res.data.sandwiches;
      // Sort by createdAt (newest first) if requested (for personal menu)
      if (sortByCreatedAt) {
        sandwiches = [...sandwiches].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
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
