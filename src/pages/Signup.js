import { Link } from "react-router-dom";

import useForm from "../hooks/use-form";

const Signup = () => {
    const {
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        errors,
        handleCreateUser,
        parentId,
    } = useForm();

    return (
        <div>
            <h2>SandwiCheck Signup</h2>

            {parentId && (
                <div className="warning">
                    You are creating a children account. You data will be
                    visible to other people who shared this link to you.
                </div>
            )}

            {errors.length > 0 && (
                <div className="error">
                    {errors.map((error, idx) => (
                        <p key={idx}>{error}</p>
                    ))}
                </div>
            )}

            <form onSubmit={handleCreateUser}>
                <div>
                    <input
                        type="name"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

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
                    <button type="Submit">Sign up</button>
                </div>
            </form>
            <div>
                Already have an account?
                <Link to={"/login" + (parentId ? "/parent/" + parentId : "")}>
                    Log In
                </Link>
            </div>
        </div>
    );
};

export default Signup;
