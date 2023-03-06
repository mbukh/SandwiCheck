import { debug } from "../constants/debug";

import { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { logIn, user } = useUserAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.uid) navigate("/home");
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await logIn(email, password);
            navigate("/home");
        } catch (err) {
            setError("Login failed, try signup instead.");
        }
    };

    return (
        !user?.uid && (
            <>
                <div>
                    <h2>Firebase Auth Login</h2>
                    {error && <div>{error}</div>}
                    <form onSubmit={handleSubmit}>
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
                            <button type="Submit">Log In</button>
                        </div>
                    </form>
                    <hr />
                </div>
                <div>
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </>
        )
    );
};

export default Login;
