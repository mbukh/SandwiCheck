import { addVoteToSandwich } from "../services/apiSandwiches";

import {
    didUserVotedForSandwichByIdUsingLocalStorage,
    addSandwichToFavoritesByUserId,
} from "../services/apiUsers";

export const hasUserVotedUserForSandwich = (sandwich, user) => {
    if (!user.id) return didUserVotedForSandwichByIdUsingLocalStorage(sandwich.id);
    return user?.favoriteSandwiches?.includes(sandwich.id);
};

export const voteForSandwich = async (sandwichId) => {
    await addSandwichToFavoritesByUserId(sandwichId);
    await addVoteToSandwich(sandwichId);
};
