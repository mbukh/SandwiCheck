import axios from "axios";

import { log, logResponse } from "../utils/log";

import { handleResponse } from "../utils/api-utils";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_SERVER}/api/v1/users`,
    headers: {
        "Access-Control-Allow-Origin": process.env.REACT_APP_HOST,
        "Content-Type": "application/json",
    },
    withCredentials: true,
    credentials: "include",
});

/*
1. GET /api/users
   Access: Private/Admin

2. GET /api/users/current
   Access: Private

3. POST /api/users/:userId/favorite-sandwiches/:sandwichId
   DELETE /api/users/:userId/favorite-sandwiches/:sandwichId
   Access: Private/User

4. PUT /api/users/:userId/week-menu/:day
   DELETE /api/users/:userId/week-menu/:day
   Access: Private/User, Private/Parent
   Parameters:
    body: { sandwichId }

5. GET /api/users/:userId
   Access: Private/User, Private/Parent

6. PUT /api/users/:userId
   Access: Private/User, Private/Parent
   Parameters:
    body: {name,
           email,
           role,
           dietaryPreferences,
           removeProfilePicture,
           unlinkParentId,
           unlinkChildId}
    file: {imageBuffer}

7. DELETE /api/users/:userId
   Access: Private/User
*/

export const fetchCurrentUser = async () => {
    return await handleResponse(async () => api.get(`/current`));
};

export const fetchUserById = async (userId) => {
    return await handleResponse(async () => api.get(`/${userId}`));
};

export const updateUserById = async ({
    name,
    email,
    role,
    dietaryPreferences,
    unlinkParentId,
    unlinkChildId,
    removeProfilePicture,
    file,
}) => {
    const formData = new FormData();

    if (name) formData.append("name", name);
    if (email) formData.append("email", email);
    if (role) formData.append("role", role);
    if (dietaryPreferences) formData.append("dietaryPreferences", dietaryPreferences);
    if (unlinkParentId) formData.append("unlinkParentId", unlinkParentId);
    if (unlinkChildId) formData.append("unlinkChildId", unlinkChildId);
    if (removeProfilePicture)
        formData.append("removeProfilePicture", removeProfilePicture);
    if (file && file.imageBuffer)
        formData.append("file", file.imageBuffer, "profile-picture.png");

    const config = {
        headers: {
            ...api.defaults.headers,
            "Content-Type": "multipart/form-data",
        },
    };

    return await handleResponse(async () => api.put(`/update`, formData, config));
};

export const addSandwichToFavoritesByUserId = async ({ userId, sandwichId }) => {
    return await handleResponse(async () =>
        api.get(`/users/${userId}/favorite-sandwiches/${sandwichId}`)
    );
};

const addSandwichToFavoritesInLocalStorage = (sandwichId) => {
    const allVotes = JSON.parse(localStorage.getItem("user_votes")) || [];
    allVotes.push(sandwichId);
    localStorage.setItem("user_votes", JSON.stringify([...new Set(allVotes)]));
};

export const didUserVotedForSandwichByIdUsingLocalStorage = (sandwichId) => {
    const allVotes = JSON.parse(localStorage.getItem("user_votes"));
    if (allVotes && allVotes.includes(sandwichId)) {
        log("User already voted locally");
        return true;
    }
    return false;
};
