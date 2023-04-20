import { useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useAuthGlobalContext } from "../context/";

import { updateUserById } from "../services/api-users";

import { readSandwichFromCache } from "../services/api-sandwiches";

import useValidate from "./use-validate";

const useForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [files, setFiles] = useState({});

    const [errors, setErrors] = useState([]);

    const { logIn, signUp, currentUser: user } = useAuthGlobalContext();
    const { validateForm } = useValidate();

    const { parentId } = useParams();
    const navigate = useNavigate();

    const redirectUser = () => {
        const unExpiredSavedSandwich = readSandwichFromCache();
        if (unExpiredSavedSandwich) {
            navigate("/create");
        } else {
            navigate("/menu");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        const errorMessages = validateForm({ name, email, password, confirmPassword });
        if (errorMessages.length) {
            setErrors(errorMessages);
            return false;
        }

        setErrors([]);

        const res = await signUp(email, password, role, parentId);
        if (!res.data) {
            setErrors(res.message);
            return;
        }

        redirectUser();
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const errorMessages = validateForm({ email, password });
        if (errorMessages.length) {
            setErrors(errorMessages);
            return false;
        }

        setErrors([]);

        const res = await logIn(email, password, parentId);

        if (!res.data) {
            setErrors(["Login failed, try signup instead."]);
            return;
        }

        redirectUser();
    };

    const handleFileChange = (event) => {
        setFiles((prev) => {
            return { ...prev, [event.target.name]: event.target.files[0] };
        });
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
        role,
        setRole,
        handleFileChange,
    };
};

export default useForm;
