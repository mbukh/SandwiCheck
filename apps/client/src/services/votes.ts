import type { ApiResult } from '@/types/api';
import type { CurrentUser, Sandwich } from '@/types/domain';
import { addVoteToSandwich } from './api-sandwiches.ts';
import { addSandwichToFavoritesByUserId, hasUserVotedForSandwichByIdUsingLocalStorage } from './api-users.ts';

export const hasUserVotedForSandwich = (sandwich: Sandwich, user: CurrentUser): boolean => {
  if (!user.id) return hasUserVotedForSandwichByIdUsingLocalStorage(sandwich.id);

  return user.favoriteSandwiches?.includes(sandwich.id) ?? false;
};

export const voteForSandwich = async ({
  userId,
  sandwichId,
}: {
  userId?: string;
  sandwichId: string;
}): Promise<ApiResult<Sandwich>> => {
  if (userId) {
    const favoritesResponse = await addSandwichToFavoritesByUserId({ userId, sandwichId });
    if (!favoritesResponse?.success) {
      return favoritesResponse as ApiResult<Sandwich>;
    }
  }

  return await addVoteToSandwich(sandwichId);
};
