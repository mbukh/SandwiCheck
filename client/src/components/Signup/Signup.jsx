import { useEffect } from "react";
import { Link } from "react-router-dom";

import { MAX_USER_NAME_LENGTH, ROLES } from "../../constants/user-constants";

import useForm from "../../hooks/use-form";
import useToast from "../../hooks/use-toast";

const Signup = () => {
    const { showToast, toastComponents } = useToast();
    const {
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        signUpHandler,
        // role,
        setRole,
        parentId,
        errors,
    } = useForm();

    useEffect(() => {
        errors.forEach((error) => showToast(error));
    }, [errors, showToast]);

    return (
        <div className="login max-w-screen-md text-white text-center mx-auto">
            <h1 className="text-magenta font-bold text-2xl md:text-4xl xl:text-5xl uppercase mb-3 md:mb-5">
                Sandwich creativity with SandwiCheck!
            </h1>
            <h4 className="text-base md:text-xl xl:text-3xl">
                Create and share your own delicious creations!
            </h4>

            {parentId && (
                <>
                    <div className="text-magenta text-base py-2 md:text-xl xl:text-3xl">
                        You are about to be added as a{" "}
                        <strong className="text-yellow">
                            dependent in another user's account,
                        </strong>{" "}
                        which means that your information will become visible to those who
                        have shared this link with you.
                    </div>
                </>
            )}

            <form
                className="needs-validation text-left text-sm mt-15 md:mt-20 xl:mt-24 md:px-5"
                onSubmit={signUpHandler}
            >
                <div className="mb-4 md:mb-6">
                    <input
                        className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
                        name="name"
                        type="name"
                        placeholder="Full name"
                        value={name}
                        maxLength={MAX_USER_NAME_LENGTH}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4 md:mb-6">
                    <input
                        className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="E-mail address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4 md:mb-6">
                    <input
                        className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4 md:mb-6">
                    <input
                        className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {parentId ? (
                    <div className="mb-4 md:mb-6 custom-control custom-checkbox">
                        <input
                            className="custom-control-input"
                            id="termsCheckbox"
                            type="checkbox"
                            name="tc_agreed"
                            value="1"
                            required
                        />
                        <label className="custom-control-label" htmlFor="termsCheckbox">
                            <span>
                                I agree to be added
                                <span className="text-magenta"> as a dependent</span> in
                                another user's account.
                            </span>
                        </label>
                    </div>
                ) : (
                    <div className="mb-2 md:mb-5 w-1/2">
                        <div className="gallery__filter-county relative">
                            <select
                                className="w-full py-1 px-4 md:px-6 appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-sm uppercase"
                                title="Choose role"
                                required={true}
                                name="role"
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="">Choose role</option>
                                {ROLES.map((role, index) => (
                                    <option key={index} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            <div className="select__arrow pointer-events-none absolute top-0 bottom-0 right-0 flex items-center text-magenta py-1 px-3 md:pr-6">
                                <svg
                                    className="fill-current w-auto h-3"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 4 5"
                                >
                                    <path d="M2 0L0 2h4zm0 5L0 3h4z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20"
                >
                    <span>Create an account</span>
                </button>
            </form>

            <br />

            <div className="w-full mb-4 md:mb-6 flex justify-center items-center">
                Already have an account?
                <Link
                    className="mx-2 underline"
                    to={"/login" + (parentId ? "/parent/" + parentId : "")}
                >
                    Log In
                </Link>
            </div>
            {toastComponents}
        </div>
    );
};

export default Signup;
