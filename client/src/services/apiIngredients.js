import axios from "axios";

import { log, logResponse } from "../utils/log";

import { TYPES, CACHE_TIME_OUT_MINS } from "../constants";

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

    ingredients = readAllIngredientsFromCache();
    if (ingredients) {
        log("📝 💾 Read ingredients from cache", ingredients);

        log("📝 ⏰ Ingredients cache timeout is set to", CACHE_TIME_OUT_MINS, "minutes.");

        return { data: ingredients };
    }

    const res = await fetchIngredients({});
    logResponse("📝 Fetch all ingredients", res);

    if (!res.data) {
        return;
    }

    ingredients = groupIngredientsByTypes(res.data);

    const result = { ...ingredients, cachedAt: Date.now() };

    localStorage.setItem("ingredients", JSON.stringify(result));

    return { data: result };
};

// UTILS //

function readAllIngredientsFromCache() {
    const cachedIngredients = JSON.parse(localStorage.getItem("ingredients"));

    if (!cachedIngredients) return null;

    const cacheExpired =
        timeDifference(cachedIngredients.cachedAt, Date.now()).minutes >
        CACHE_TIME_OUT_MINS;

    if (cacheExpired) return null;

    return cachedIngredients;
}

function groupIngredientsByTypes(ingredients) {
    const groupedIngredients = ingredients.reduce((acc, ingredient) => {
        if (!acc[ingredient.type]) {
            acc[ingredient.type] = [];
        }
        acc[ingredient.type].push(ingredient);
        return acc;
    }, {});

    return groupedIngredients;
}
