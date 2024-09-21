import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import useForm from '../../hooks/use-form';
import useToast from '../../hooks/use-toast';

const Login = () => {
  const { showToast, toastComponents } = useToast();
  const { email, setEmail, password, setPassword, LoginHandler, parentId, errors } = useForm();

  useEffect(() => {
    errors.forEach((error) => showToast(error));
  }, [errors, showToast]);

  return (
    <div className="login max-w-screen-md text-white text-center mx-auto">
      <h1 className="text-magenta font-bold text-2xl md:text-4xl xl:text-5xl uppercase mb-3 md:mb-5">
        Sandwich creativity with SandwiCheck!
      </h1>
      <h4 className="text-base md:text-xl xl:text-3xl">Create and share your own delicious creations!</h4>

      {parentId && (
        <>
          <div className="text-magenta text-base py-2 md:text-xl xl:text-3xl">
            You are about to be added as a <strong className="text-yellow">dependent in another user's account,</strong>{' '}
            which means that your information will become visible to those who have shared this link with you.
          </div>
        </>
      )}

      <form className="needs-validation text-left text-sm mt-15 md:mt-20 xl:mt-24 md:px-5" onSubmit={LoginHandler}>
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
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
                <span className="text-magenta"> as a dependent</span> in another user's account.
              </span>
            </label>
          </div>
        ) : (
          <div className="mb-2 md:mb-5 custom-control custom-checkbox"></div>
        )}

        <button
          type="submit"
          className="w-full inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20"
        >
          <span>Log in</span>
        </button>
      </form>

      <br />

      <div className="w-full mb-4 md:mb-6 flex justify-center items-center">
        Don't have an account?
        <Link className="mx-2 underline" to={'/signup' + (parentId ? '/parent/' + parentId : '')}>
          Sign up
        </Link>
      </div>
      {toastComponents}
    </div>
  );
};

export default Login;
