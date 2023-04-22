import axios from "axios";

import { SANDWICH_CACHE_TIME_OUT_DAYS } from "../constants/sandwich-constants";

import { log } from "../utils/log";

import { timeDifference } from "../utils/index";

import { handleResponse } from "../utils/api-utils";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_SERVER}/api/v1/sandwiches`,
    headers: {
        "Access-Control-Allow-Origin": process.env.REACT_APP_HOST,
        "Content-Type": "application/json",
    },
    withCredentials: true,
    credentials: "include",
});

/*
1. GET /api/sandwiches
   Access: Public
   Parameters:
    query, body: { dietaryPreferences, ingredients, sortBy, page, limit }

2. POST /api/sandwiches
   Access: Private
   Parameters:
    body: { name, ingredients, comment }

3. GET /api/sandwiches/:sandwichId
   Access: Public

4. PUT /api/sandwiches/:sandwichId
   Access: Private
   Parameters:
    body: { name, ingredients, comment }

5. DELETE /api/sandwiches/:sandwichId
   Access: Private

6. POST /api/sandwiches/:sandwichId/vote
   DELETE /api/sandwiches/:sandwichId/vote
   Access: Private
*/

export const fetchSandwiches = async (query) => {
    // dietaryPreferences:[], ingredients:[], sortBy:(def)"createdAt"|"votesCount"
    // page:1, limit:48
    return await handleResponse(async () => api.get("/", { params: query }));
};

export const fetchSandwichById = async (sandwichId) => {
    return await handleResponse(async () => api.get(`/${sandwichId}`));
};

export const createSandwich = async (query) => {
    //name, ingredients, comment
    return await handleResponse(async () => api.post("/", query));
};

export const addVoteToSandwich = async (sandwichId) => {
    return await handleResponse(async () => api.post(`/${sandwichId}/vote`));
};

export const removeVoteFromSandwich = async (sandwichId) => {
    return await handleResponse(async () => api.delete(`/${sandwichId}/vote`));
};

export const readSandwichFromCache = () => {
    log("🥪 💾 Reading sandwich from cache");

    const sandwich = JSON.parse(localStorage.getItem("sandwich"));
    const cachedAt = JSON.parse(localStorage.getItem("sandwich-cachedAt"));

    const cacheExpired =
        timeDifference(cachedAt, Date.now()).days > SANDWICH_CACHE_TIME_OUT_DAYS;

    if (!sandwich || cacheExpired) {
        return null;
    }

    log("🥪 ⏰ Sandwich cache timeout is set to", SANDWICH_CACHE_TIME_OUT_DAYS, "days");

    return sandwich;
};

export const updateSandwichInCache = (sandwich) => {
    log("Writing sandwich to cache");

    localStorage.setItem("sandwich", JSON.stringify(sandwich));
    localStorage.setItem("sandwich-cachedAt", JSON.stringify(Date.now()));
};

export const deleteSandwichFromCache = () => {
    log("Removing sandwich from cache");

    localStorage.removeItem("sandwich");
};
