import { addVoteToSandwich } from '../services/api-sandwiches';
import { addSandwichToFavoritesByUserId, hasUserVotedForSandwichByIdUsingLocalStorage } from '../services/api-users';

export const hasUserVotedForSandwich = (sandwich, user) => {
  if (!user.id) return hasUserVotedForSandwichByIdUsingLocalStorage(sandwich.id);

  return user.favoriteSandwiches?.includes?.(sandwich.id) ?? false;
};

export const voteForSandwich = async ({ userId, sandwichId }) => {
  if (userId) {
    const favoritesResponse = await addSandwichToFavoritesByUserId({ userId, sandwichId });
    if (!favoritesResponse?.success) {
      return favoritesResponse;
    }
  }

  return await addVoteToSandwich(sandwichId);
};
