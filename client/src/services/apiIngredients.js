import axios from "axios";

import { log, logResponse } from "../utils/log";

import { INGREDIENT_TYPES, CACHE_TIME_OUT_MINS } from "../constants";

import { handleResponse } from "../utils/api-utils";

import { timeDifference } from "../utils";

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

const fetchIngredients = async (query) => {
    return await handleResponse(async () => api.get("/", { params: query }));
};

// =================

export const getAllIngredients = async () => {
    const cachedIngredients = readAllIngredientsFromCache();

    if (cachedIngredients) {
        log("📝 💾 All ingredients retrieved from cache", cachedIngredients);
        return cachedIngredients;
    }

    const res = await fetchIngredients();
    logResponse("📝 Fetch all ingredients", res);

    const groupedIngredients = groupAndSortIngredients(res.data || []);

    localStorage.setItem(
        "ingredients",
        JSON.stringify({ ...groupedIngredients, cachedAt: Date.now() })
    );

    return groupedIngredients;
};

// UTILS //

function readAllIngredientsFromCache() {
    const cachedIngredients = JSON.parse(localStorage.getItem("ingredients"));

    if (!cachedIngredients) return null;

    const cacheExpired =
        timeDifference(cachedIngredients.cachedAt, Date.now()).minutes >
        CACHE_TIME_OUT_MINS;

    if (cacheExpired) return null;

    log("⌛️ Cache timeout is set to", CACHE_TIME_OUT_MINS, "minutes.");

    return cachedIngredients;
}

function groupAndSortIngredients(ingredients) {
    const groupedIngredients = ingredients.reduce((acc, ingredient) => {
        if (!acc[ingredient.type]) {
            acc[ingredient.type] = [];
        }
        acc[ingredient.type].push(ingredient);
        return acc;
    }, {});

    // sort by display priority
    INGREDIENT_TYPES.forEach((type) => {
        if (!groupedIngredients[type]) return;

        groupedIngredients[type].sort((a, b) => b.displayPriority - a.displayPriority);
    });

    return groupedIngredients;
}
