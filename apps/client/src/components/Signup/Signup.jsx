import { useEffect, useState } from 'react';
import { Link, useSearch, useLocation } from '@tanstack/react-router';

import { MAX_USER_NAME_LENGTH, ROLE } from '../../constants/user-constants';
import { ROUTE_PATHS } from '../../routes';

import useForm from '../../hooks/use-form';
import useToast from '../../hooks/use-toast';
import { isAuthRoute } from '../../utils/auth-utils';

const Signup = () => {
  const { showToast, toastComponents } = useToast();
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const search = useSearch({ strict: false });
  const location = useLocation();
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

  // Determine returnTo value (same logic as Login component)
  const returnTo = search?.returnTo || (!isAuthRoute(location.pathname) ? location.pathname : null);

  useEffect(() => {
    errors.forEach((error) => showToast(error));
  }, [errors, showToast]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signUpHandler(e, returnTo);
      if (result && result.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
        setConfirmationEmail(result.email || email);
        setConfirmationMessage(result.message || '');
        // Reset form fields
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show email confirmation message if needed
  if (needsEmailConfirmation) {
    return (
      <div className="login max-w-screen-md text-white text-center mx-auto">
        <h1 className="text-magenta font-bold text-2xl md:text-4xl xl:text-5xl uppercase mb-3 md:mb-5">
          Check Your Email!
        </h1>
        <div className="text-base md:text-xl xl:text-3xl mb-6 md:mb-8">
          {confirmationMessage && confirmationMessage.includes('confirmation email could not be sent') ? (
            <>
              <p className="mb-4">
                Your account has been created for <strong className="text-yellow">{confirmationEmail}</strong>
              </p>
              <p className="mb-4 text-yellow">
                However, the confirmation email could not be sent. Please use the resend confirmation option on the
                login page.
              </p>
              <p className="text-sm md:text-base xl:text-lg">
                Once you've confirmed your email, you'll be able to log in and start creating delicious sandwiches!
              </p>
            </>
          ) : (
            <>
              <p className="mb-4">
                We've sent a confirmation email to <strong className="text-yellow">{confirmationEmail}</strong>
              </p>
              <p className="mb-4">Please check your inbox and click the confirmation link to activate your account.</p>
              <p className="text-sm md:text-base xl:text-lg">
                Once you've confirmed your email, you'll be able to log in and start creating delicious sandwiches!
              </p>
            </>
          )}
        </div>
        <div className="w-full mb-4 md:mb-6 flex justify-center items-center">
          {parentId ? (
            <Link
              className="mx-2 underline"
              to={ROUTE_PATHS.LOGIN_PARENT}
              params={{ parentId }}
              search={returnTo ? { returnTo } : {}}
            >
              Back to Log In
            </Link>
          ) : (
            <Link
              className="mx-2 underline"
              to={ROUTE_PATHS.LOGIN}
              search={returnTo ? { returnTo } : {}}
            >
              Back to Log In
            </Link>
          )}
        </div>
        {toastComponents}
      </div>
    );
  }

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

      <form
        className="needs-validation text-left text-sm mt-15 md:mt-20 xl:mt-24 md:px-5"
        noValidate
        onSubmit={handleSignUp}
      >
        <div className="mb-4 md:mb-6">
          <label htmlFor="signup-name" className="sr-only">
            Full name
          </label>
          <input
            id="signup-name"
            className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
            name="name"
            type="text"
            autoComplete="name"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck="false"
            placeholder="Full name"
            value={name}
            maxLength={MAX_USER_NAME_LENGTH}
            onChange={(e) => setName(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div className="mb-4 md:mb-6">
          <label htmlFor="signup-email" className="sr-only">
            Email address
          </label>
          <input
            id="signup-email"
            className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            placeholder="E-mail address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div className="mb-4 md:mb-6">
          <label htmlFor="signup-password" className="sr-only">
            Password
          </label>
          <input
            id="signup-password"
            className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
            name="password"
            type="password"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div className="mb-4 md:mb-6">
          <label htmlFor="signup-confirm-password" className="sr-only">
            Confirm password
          </label>
          <input
            id="signup-confirm-password"
            className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-required="true"
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
                {ROLE.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="select__arrow pointer-events-none absolute top-0 bottom-0 right-0 flex items-center text-magenta py-1 px-3 md:pr-6">
                <svg className="fill-current w-auto h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5">
                  <path d="M2 0L0 2h4zm0 5L0 3h4z"></path>
                </svg>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? 'Creating account...' : 'Create an account'}</span>
        </button>
      </form>

      <br />

      <div className="w-full mb-4 md:mb-6 flex justify-center items-center">
        Already have an account?
        {parentId ? (
          <Link className="mx-2 underline" to={ROUTE_PATHS.LOGIN_PARENT} params={{ parentId }}>
            Log In
          </Link>
        ) : (
          <Link className="mx-2 underline" to={ROUTE_PATHS.LOGIN}>
            Log In
          </Link>
        )}
      </div>
      {toastComponents}
    </div>
  );
};

export default Signup;
