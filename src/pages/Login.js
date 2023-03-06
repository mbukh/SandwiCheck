import { useState, useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { logIn, user } = useUserAuth();
    const { parentId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.uid && !parentId) navigate("/home");
    }, [user, navigate, parentId]);

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
        <>
            <div>
                <h2>Firebase Auth Login</h2>
                {error && <div className="error">{error}</div>}
                {parentId && (
                    <div className="warning">
                        You are creating a children account. You data will be
                        visible to other people who shared this link to you.
                    </div>
                )}
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
                Don't have an account?
                <Link to={"/signup" + (parentId ? "/parent/" + parentId : "")}>
                    Sign up
                </Link>
            </div>
        </>
    );
};

export default Login;
