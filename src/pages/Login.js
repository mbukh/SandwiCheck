import { Link } from "react-router-dom";

import useForm from "../hooks/use-form";

const Login = () => {
    const {
        email,
        setEmail,
        password,
        setPassword,
        errors,
        handleLogin,
        parentId,
    } = useForm();

    return (
        <div>
            <h2>SandwiCheck Login</h2>

            {parentId && (
                <div className="warning">
                    You are about to be added as a child to another account. You
                    data will become visible to other people who shared this
                    link to you.
                </div>
            )}

            {errors.length > 0 && (
                <div className="error">
                    {errors.map((error, idx) => (
                        <p key={idx}>{error}</p>
                    ))}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div>
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div>
                    <button type="Submit">Log In</button>
                </div>
            </form>
            <hr />
            <div>
                Don't have an account?
                <Link to={"/signup" + (parentId ? "/parent/" + parentId : "")}>
                    Sign up
                </Link>
            </div>
        </div>
    );
};

export default Login;
