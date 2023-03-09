import { useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

import { createUser, updateUserById } from "../services/apiUsers";

import useValidate from "./use-validate";

const useForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const { logIn, signUp, user } = useUserAuth();
    const navigate = useNavigate();
    const { parentId } = useParams();
    const { validateForm } = useValidate();

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const errorMessages = validateForm({ name, email, password });
        if (errorMessages.length) {
            setErrors(errorMessages);
            return false;
        }
        setErrors([]);
        try {
            const signUpResult = await signUp(email, password);
            await createUser(signUpResult.user.uid, {
                name,
                ...(parentId && { parents: [parentId] }),
            });
            parentId &&
                updateUserById(parentId, { children: signUpResult.user.uid });
            navigate("/home");
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
                    updateUserById(loginResult.user.uid, {
                        parents: parentId,
                    }),
                    updateUserById(parentId, {
                        children: loginResult.user.uid,
                    }),
                ]);
            navigate("/home");
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
