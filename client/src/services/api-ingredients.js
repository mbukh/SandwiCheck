import axios from "axios";

import { log, logResponse } from "../utils/log";

import { INGREDIENTS_CACHE_TIME_OUT_MINS } from "../constants/ingredients-constants";

import { handleResponse } from "../utils/api-utils";

import { timeDifference } from "../utils/utils";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_SERVER}/api/v1/ingredients`,
    headers: {
        "Access-Control-Allow-Origin": process.env.REACT_APP_HOST,
        "Content-Type": "application/json",
    },
    withCredentials: true,
    credentials: "include",
});

/*
1.  GET /api/ingredients
    Access: Public
    Parameters:
        query, body: { dietaryPreferences, type, sortBy }
        sortBy:(def)"displayPriority"|"name"

2.  GET /api/ingredients/:ingredientId
    Access: Public

3.  POST /api/ingredients
    Access: Private/Admin
    Parameters:
        body: { name, type, dietaryPreferences, shape, displayPriority }
        files: { reqFiles }

4.  PUT /api/ingredients/:ingredientId
    Access: Private/Admin
    Parameters:
        body: { name, type, dietaryPreferences, shape, displayPriority }
        files: { reqFiles }

5.  DELETE /api/ingredients/:ingredientId
    Access: Private/Admin
*/

const fetchIngredients = async ({ dietaryPreferences, type, sortBy }) => {
    // sortBy:(def)"displayPriority"|"name"
    return await handleResponse(async () =>
        api.get("/", { params: { dietaryPreferences, type, sortBy } })
    );
};

// =================

export const getAllIngredients = async () => {
    let ingredients;

    ingredients = readIngredientsFromCache();
    if (ingredients) {
        log("📝 💾 Read ingredients from cache", ingredients);
        log(
            "📝 ⏰ Ingredients cache timeout is set to",
            INGREDIENTS_CACHE_TIME_OUT_MINS,
            "minutes."
        );
        return { data: ingredients };
    }

    const res = await fetchIngredients({});
    logResponse("📝 Fetch ingredients", res);

    if (res.data) {
        ingredients = res.data;

        localStorage.setItem("ingredients", JSON.stringify(ingredients));
        localStorage.setItem("ingredients-cashedAt", JSON.stringify(Date.now()));
    }

    return { data: ingredients };
};

// UTILS //

function readIngredientsFromCache() {
    const ingredients = JSON.parse(localStorage.getItem("ingredients"));
    const cachedAt = JSON.parse(localStorage.getItem("ingredients-cashedAt"));

    if (!ingredients) return null;

    const cacheExpired =
        timeDifference(cachedAt, Date.now()).minutes > INGREDIENTS_CACHE_TIME_OUT_MINS;

    if (cacheExpired) return null;

    return ingredients;
}
