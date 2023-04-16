// api.js

import axios from "axios";

import { debug } from "../constants/debug";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_SERVER}/api/v1/`,
    headers: { "Content-Type": "application/json" },
});

// *** UTILS ***

async function handleResponse(requestFunction) {
    try {
        const response = await requestFunction();
        return response.data;
    } catch (error) {
        if (debug) {
            console.error("Error request: ", error.response.data);
        }
        return error.response.data;
    }
}

// *** END UTILS ***

export const signup = async (email, password, name, role, parentId) => {
    return await handleResponse(async () => {
        return api.post("/auth/signup", { email, password, name, role, parentId });
    });
};

export const login = async (email, password) => {
    return await handleResponse(async () => {
        return api.post("/auth/login", { email, password });
    });
};

export const logout = async () => {
    return await handleResponse(async () => {
        return api.post("/auth/logout");
    });
};

export const readCurrentUser = async (userId) => {
    return await handleResponse(async () => api.get(`/users/current`));
};

export const readUserById = async (userId) => {
    return await handleResponse(async () => api.get(`/users/${userId}`));
};

export const getSandwiches = async (query) => {
    return await handleResponse(async () => api.get("/sandwiches", { params: query }));
};
