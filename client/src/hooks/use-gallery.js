import { useState, useCallback } from "react";

import { logResponse } from "../utils/log";

import * as apiSandwiches from "../services/api-sandwiches";

import * as apiUsers from "../services/api-users";

const useGallery = () => {
    const [gallerySandwiches, setGallerySandwiches] = useState([]);

    const fetchSandwiches = useCallback(
        async ({
            dietaryPreferences = [],
            ingredients = [],
            sortBy = "createdAt", // votesCount || votes
            page = 1,
            limit = 48,
        }) => {
            const res = await apiSandwiches.fetchSandwiches({
                dietaryPreferences,
                ingredients,
                sortBy,
                page,
                limit,
            });
            logResponse("🥪 Read sandwiches", res);

            setGallerySandwiches(res.data || []);
        },
        []
    );

    const fetchUserSandwiches = useCallback(async (id) => {
        const res = await apiUsers.fetchUserById(id);
        logResponse("🍔👽 Fetch user with sandwiches", res);

        if (res.data) {
            setGallerySandwiches(res.data.sandwiches || []);
        }
    }, []);

    return {
        gallerySandwiches,
        setGallerySandwiches,
        fetchUserSandwiches,
        fetchSandwiches,
    };
};

export default useGallery;
