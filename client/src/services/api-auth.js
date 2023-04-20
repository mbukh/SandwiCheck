import axios from "axios";

import { handleResponse } from "../utils/api-utils";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_SERVER}/api/v1/auth/`,
    headers: {
        "Access-Control-Allow-Origin": process.env.REACT_APP_HOST,
        "Content-Type": "application/json",
    },
    withCredentials: true,
    credentials: "include",
});

/*
1. POST /api/auth/signup
  Access: Public
  Parameters:
    body: { name, email, password, role, parentId }

2. POST /api/auth/login
  Access: Public
  Parameters:
    body: { email, password, parentId }

3. POST /auth/create-child
  Access: Private/Parent
  Parameters:
    body: { name }

4. POST /auth/switch-to-parent
  Access: Private/Child

5. POST /api/auth/login-child
  Access: Private/Parent
  Parameters:
    body: { childId }

6. PUT /api/auth/change-password
  Access: Private
  Parameters:
    body: { oldPassword, newPassword }

7. POST /api/auth/forgot-password
  Access: Public
  Parameters:
    body: { email }

8. PUT /api/auth/reset-password/:resetToken
  Access: Public
  Parameters:
    body: { newPassword }
    params: { resetToken }

9. POST /api/auth/logout
  Access: Private
*/

export const signup = async (email, password, name, role, parentId) => {
    return await handleResponse(async () => {
        return api.post("/signup", { email, password, name, role, parentId });
    });
};

export const login = async ({ email, password, parentId }) => {
    return await handleResponse(async () => {
        return api.post("/login", { email, password, parentId });
    });
};

export const logout = async () => {
    return await handleResponse(async () => {
        return api.post("/logout");
    });
};
