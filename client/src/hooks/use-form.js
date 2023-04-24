import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuthGlobalContext } from "../context/AuthContext";

import { readSandwichFromCache } from "../services/api-sandwiches";

import validateForm from "../utils/validate-utils";

const useForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    // const [files, setFiles] = useState({});

    const [errors, setErrors] = useState([]);

    const { logIn, signUp, currentUser: user } = useAuthGlobalContext();

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

    const LoginHandler = async (e) => {
        e.preventDefault();
        setErrors([]);

        const errorMessages = validateForm({ email, password });
        if (errorMessages.length) {
            return setErrors(errorMessages);
        }

        const res = await logIn({ email, password, parentId });
        if (res.error) {
            return setErrors(["Login failed, try signup instead"]);
        }

        redirectUser();
    };

    const signUpHandler = async (e) => {
        e.preventDefault();
        setErrors([]);

        const errorMessages = validateForm({ name, email, password, confirmPassword });
        if (errorMessages.length) {
            return setErrors(errorMessages);
        }

        const res = await signUp({ name, email, password, role, parentId });
        if (res.error) {
            return setErrors([res.error.message]);
        }

        redirectUser();
    };

    const handleFileChange = (event) => {
        // setFiles((prev) => {
        //     return { ...prev, [event.target.name]: event.target.files[0] };
        // });
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
        LoginHandler,
        signUpHandler,
        navigate,
        parentId,
        role,
        setRole,
        handleFileChange,
    };
};

export default useForm;
