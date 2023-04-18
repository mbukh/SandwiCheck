import axios from "axios";

import { debug, CACHE_TIME_OUT_MINS } from "../constants";

import { log, logResponse } from "../utils/log";

import { trimObjectEmptyProperties, timeDifference } from "../utils";

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
    return await handleResponse(async () => api.post("/", { params: query }));
};

export const addVoteToSandwich = async (sandwichId) => {
    return await handleResponse(async () => api.post(`/${sandwichId}/vote`));
};

export const removeVoteFromSandwich = async (sandwichId) => {
    return await handleResponse(async () => api.delete(`/${sandwichId}/vote`));
};

export const readSandwichFromLocalStorage = () => {
    log("Reading sandwich from cache");
    const cachedSandwich = JSON.parse(localStorage.getItem("sandwich"));
    if (!cachedSandwich) return null;
    const cacheExpired =
        timeDifference(cachedSandwich.updatedAt, Date.now()).minutes >
        CACHE_TIME_OUT_MINS;
    if (cacheExpired) return null;
    log("🥪 ⏰ Sandwich cache timeout is set to", CACHE_TIME_OUT_MINS, "minutes");
    const { updatedAt, ...sandwich } = cachedSandwich;
    return sandwich;
};

export const updateSandwichToLocalStorage = (sandwichData) => {
    log("Writing sandwich to cache");
    return localStorage.setItem(
        "sandwich",
        JSON.stringify({
            ...sandwichData,
            updatedAt: Date.now(),
        })
    );
};

export const deleteSandwichFromLocalStorage = () => {
    log("Removing sandwich from cache");
    localStorage.removeItem("sandwich");
};
