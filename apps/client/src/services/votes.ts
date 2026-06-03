import type { ApiResult } from '@/types/api';
import type { CurrentUser, Sandwich } from '@/types/domain';
import { addVoteToSandwich } from './api-sandwiches.ts';

export const hasUserVotedForSandwich = (sandwich: Sandwich, user: CurrentUser): boolean => {
  // Voting requires an account; a logged-out visitor has never voted.
  if (!user.id) return false;

  // A vote adds the sandwich to the user's favorites, so a favorited sandwich is a voted one.
  return user.favoriteSandwiches?.includes(sandwich.id) ?? false;
};

export const voteForSandwich = async ({ sandwichId }: { sandwichId: string }): Promise<ApiResult<Sandwich>> => {
  /*
   * Casts an authenticated vote. The server couples voting to favorites: a single
   * call increments the sandwich's votesCount and adds it to the caller's favorites
   * (idempotent per user). Logged-out visitors are routed to signup by the caller.
   */
  return await addVoteToSandwich(sandwichId);
};
