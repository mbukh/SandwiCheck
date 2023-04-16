import { useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useAuthGlobalContext } from "../context/";

import { createUser, updateUserById } from "../services/apiUsers";

import { readSandwichFromLocalStorage } from "../services/apiSandwiches";

import useValidate from "./use-validate";

const useForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const { logIn, signUp, user } = useAuthGlobalContext();
    const { parentId } = useParams();
    const { validateForm } = useValidate();
    const navigate = useNavigate();

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const errorMessages = validateForm({ name, email, password, confirmPassword });
        if (errorMessages.length) {
            setErrors(errorMessages);
            return false;
        }
        setErrors([]);
        try {
            const signUpResult = await signUp(email, password);
            await createUser(signUpResult.user.id, {
                name,
                ...(parentId && { parents: [parentId] }),
            });
            parentId && updateUserById(parentId, { children: signUpResult.user.id });
            const unExpiredSavedSandwich = readSandwichFromLocalStorage();
            if (unExpiredSavedSandwich) navigate("/create");
            else navigate("/menu");
        } catch (err) {
            setErrors(["Signup failed, try login instead."]);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const errorMessages = validateForm({ email, password });
        if (errorMessages.length) {
            setErrors(errorMessages);
            return false;
        }
        setErrors([]);
        try {
            const loginResult = await logIn(email, password);
            parentId &&
                Promise.all([
                    updateUserById(loginResult.user.id, {
                        parents: parentId,
                    }),
                    updateUserById(parentId, {
                        children: loginResult.user.id,
                    }),
                ]);
            const unExpiredSavedSandwich = readSandwichFromLocalStorage();
            if (unExpiredSavedSandwich) navigate("/create");
            else navigate("/menu");
        } catch (err) {
            setErrors(["Login failed, try signup instead."]);
        }
    };

    return {
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        errors,
        setErrors,
        logIn,
        signUp,
        user,
        handleLogin,
        handleCreateUser,
        navigate,
        parentId,
    };
};

export default useForm;
