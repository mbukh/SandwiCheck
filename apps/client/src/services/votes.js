import { addVoteToSandwich } from '../services/api-sandwiches';
import { addSandwichToFavoritesByUserId, hasUserVotedForSandwichByIdUsingLocalStorage } from '../services/api-users';

export const hasUserVotedForSandwich = (sandwich, user) => {
  if (!user.id) return hasUserVotedForSandwichByIdUsingLocalStorage(sandwich.id);

  return user.favoriteSandwiches.includes(sandwich.id);
};

export const voteForSandwich = async ({ userId, sandwichId }) => {
  if (userId) {
    await addSandwichToFavoritesByUserId({ userId, sandwichId });
  }
  await addVoteToSandwich(sandwichId);
};
