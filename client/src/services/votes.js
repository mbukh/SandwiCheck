import { addVoteToSandwich } from "../services/api-sandwiches";

import {
    didUserVotedForSandwichByIdUsingLocalStorage,
    addSandwichToFavoritesByUserId,
} from "../services/api-users";

export const hasUserVotedUserForSandwich = (sandwich, user) => {
    if (!user.id) return didUserVotedForSandwichByIdUsingLocalStorage(sandwich.id);

    if (!user.favoriteSandwiches) {
        return false;
    }

    return user.favoriteSandwiches.includes(sandwich.id);
};

export const voteForSandwich = async ({ userId, sandwichId }) => {
    if (userId) {
        await addSandwichToFavoritesByUserId({ userId, sandwichId });
    }
    await addVoteToSandwich(sandwichId);
};
