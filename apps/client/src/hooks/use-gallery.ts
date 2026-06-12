import { type Dispatch, type SetStateAction, useCallback, useRef, useState } from 'react';
import type { SandwichQuery } from '@/services/api-sandwiches';
import * as apiSandwiches from '@/services/api-sandwiches';
import * as apiUsers from '@/services/api-users';
import type { Sandwich } from '@/types/domain';
import { logResponse } from '@/utils/log';

interface UseGalleryResult {
  gallerySandwiches: Sandwich[];
  setGallerySandwiches: Dispatch<SetStateAction<Sandwich[]>>;
  galleryError: string | null;
  fetchUserSandwiches: (id: string, sortByCreatedAt?: boolean) => Promise<void>;
  fetchSandwiches: (query: SandwichQuery) => Promise<void>;
}

const GALLERY_ERROR_FALLBACK = 'We could not load these sandwiches right now.';

const useGallery = (): UseGalleryResult => {
  const [gallerySandwiches, setGallerySandwiches] = useState<Sandwich[]>([]);
  // null = no error. A failed load sets this so the gallery can show a retry instead of a fake "empty".
  const [galleryError, setGalleryError] = useState<string | null>(null);
  /*
   * Monotonic request counter shared by both fetchers. Each call captures its generation; only the
   * most recent request commits state, so a slow earlier response can't clobber a newer one
   * (out-of-order responses when the gallery refetches in quick succession).
   */
  const requestGenerationRef = useRef(0);

  const fetchSandwiches = useCallback(
    async ({
      dietaryPreferences = [],
      ingredients = [],
      sortBy = 'createdAt', // votesCount || votes
      page = 1,
      limit = 48,
    }: SandwichQuery): Promise<void> => {
      const generation = ++requestGenerationRef.current;
      const res = await apiSandwiches.fetchSandwiches({
        dietaryPreferences,
        ingredients,
        sortBy,
        page,
        limit,
      });
      logResponse('🥪 Read sandwiches', res);

      // A newer request started while this one was in flight — drop this (stale) response.
      if (generation !== requestGenerationRef.current) {
        return;
      }

      if (res.success) {
        setGallerySandwiches(res.data || []);
        setGalleryError(null);
      } else {
        // Keep any previously loaded sandwiches; surface the error for the empty-first-load case.
        setGalleryError(res.error?.message || GALLERY_ERROR_FALLBACK);
      }
    },
    [],
  );

  const fetchUserSandwiches = useCallback(async (id: string, sortByCreatedAt = false): Promise<void> => {
    const generation = ++requestGenerationRef.current;
    const res = await apiUsers.fetchUserById(id);
    logResponse('🍔👽 Fetch user with sandwiches', res);

    // A newer request started while this one was in flight — drop this (stale) response.
    if (generation !== requestGenerationRef.current) {
      return;
    }

    if (res.success && res.data) {
      // User.sandwiches may be IDs (unpopulated responses) or full objects; keep only the latter.
      let sandwiches: Sandwich[] = (res.data.sandwiches || []).filter((s): s is Sandwich => typeof s !== 'string');
      // Sort by createdAt (newest first) if requested (for personal menu)
      if (sortByCreatedAt) {
        sandwiches = [...sandwiches].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        });
      }
      setGallerySandwiches(sandwiches);
      setGalleryError(null);
    } else {
      setGalleryError(res.error?.message || GALLERY_ERROR_FALLBACK);
    }
  }, []);

  return {
    gallerySandwiches,
    setGallerySandwiches,
    galleryError,
    fetchUserSandwiches,
    fetchSandwiches,
  };
};

export default useGallery;
