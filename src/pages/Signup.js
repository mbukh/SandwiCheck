import { useState, useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

import { createUser } from "../services/apiUsers";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { signUp, user } = useUserAuth();
    const { parentId } = useParams();
    let navigate = useNavigate();

    useEffect(() => {
        if (user?.uid && !parentId) navigate("/home");
    }, [user, navigate, parentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const signUpResult = await signUp(email, password);
            await createUser(signUpResult.user.uid, {
                name,
                ...(parentId && { parents: [parentId] }),
            });
            navigate("/home");
        } catch (err) {
            setError("Signup failed, try login instead.");
        }
    };

    return (
        <>
            <div>
                <h2>Firebase Auth Signup</h2>
                {error && <div className="error">{error}</div>}
                {parentId && (
                    <div className="warning">
                        You are about to be added as a child to another account.
                        You data will become visible to other people who shared
                        this link to you.
                    </div>
                )}

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
                Already have an account?
                <Link to={"/login" + (parentId ? "/parent/" + parentId : "")}>
                    Log In
                </Link>
            </div>
        </>
    );
};

export default Signup;
