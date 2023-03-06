import { debug } from "../constants/debug";

import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

import { createUser } from "../services/apiUsers";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { signUp } = useUserAuth();
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const signUpResult = await signUp(email, password);
            await createUser(signUpResult.user.uid, { name });
            navigate("/");
        } catch (err) {
            setError("Signup failed, try login instead.");
        }
    };

    return (
        <>
            <div>
                <h2>Firebase Auth Signup</h2>
                {error && <div>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="name"
                            placeholder="Full name"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            placeholder="Email address"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <button type="Submit">Sign up</button>
                    </div>
                </form>
            </div>
            <div>
                Already have an account? <Link to="/">Log In</Link>
            </div>
        </>
    );
};

export default Signup;
