import { useState, useEffect, useRef, useCallback } from "react";

import { log, logResponse } from "../utils/log";

import * as apiSandwiches from "../services/apiSandwiches";

import * as apiUsers from "../services/apiUsers";

const useGallery = () => {
    const [gallerySandwiches, setGallerySandwiches] = useState([]);

    const fetchSandwiches = useCallback(
        async ({
            dietaryPreferences = undefined,
            ingredients = undefined,
            sortBy = "createdAt", // votesCount || votes
            page = undefined,
            limit = undefined,
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