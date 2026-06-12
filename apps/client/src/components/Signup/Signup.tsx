import { useEffect, useState } from 'react';
import { Link, useLocation, useSearch } from '@tanstack/react-router';
import { MAX_USER_NAME_LENGTH } from '@sandwicheck/shared';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { SIGNUP_ROLES } from '@/constants/user-constants';
import useForm from '@/hooks/use-form';
import useToast from '@/hooks/use-toast';
import { isAuthRoute } from '@/utils/auth-utils';

const Signup = (): React.JSX.Element => {
  const { showToast, toastComponents } = useToast();
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [emailFailedToSend, setEmailFailedToSend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tcAgreed, setTcAgreed] = useState(false);
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
  const returnTo: string | null = search?.returnTo || (isAuthRoute(location.pathname) ? null : location.pathname);

  useEffect(() => {
    for (const error of errors) showToast(error);
  }, [errors, showToast]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    /*
     * The form is noValidate, so the consent checkbox's `required` is inert —
     * enforce the dependent-account consent here.
     */
    if (parentId && !tcAgreed) {
      showToast('Please agree to be added as a dependent to continue');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await signUpHandler(e, returnTo);
      if (result && result.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
        setConfirmationEmail(result.email || email);
        // emailSent === false means the account was created but the confirmation email failed.
        setEmailFailedToSend(result.emailSent === false);
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
      <div className="login mx-auto max-w-screen-md text-center text-white">
        <h1 className="mb-3 text-2xl font-bold text-magenta uppercase md:mb-5 md:text-4xl xl:text-5xl">
          Check Your Email!
        </h1>
        <div className="mb-6 text-base md:mb-8 md:text-xl xl:text-3xl">
          {emailFailedToSend ? (
            <>
              <p className="mb-4">
                Your account has been created for <strong className="text-yellow">{confirmationEmail}</strong>
              </p>
              <p className="text-yellow mb-4">
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
        <div className="mb-4 flex w-full items-center justify-center md:mb-6">
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
            <Link className="mx-2 underline" to={ROUTE_PATHS.LOGIN} search={returnTo ? { returnTo } : {}}>
              Back to Log In
            </Link>
          )}
        </div>
        {toastComponents}
      </div>
    );
  }

  return (
    <div className="login mx-auto max-w-screen-md text-center text-white">
      <h1 className="mb-3 text-2xl font-bold text-magenta uppercase md:mb-5 md:text-4xl xl:text-5xl">
        Sandwich creativity with SandwiCheck!
      </h1>
      <h4 className="text-base md:text-xl xl:text-3xl">Create and share your own delicious creations!</h4>

      {parentId && (
        <>
          <div className="py-2 text-base text-magenta md:text-xl xl:text-3xl">
            You are about to be added as a <strong className="text-yellow">dependent in another user's account,</strong>{' '}
            which means that your information will become visible to those who have shared this link with you.
          </div>
        </>
      )}

      <form
        className="needs-validation mt-15 text-left text-sm md:mt-20 md:px-5 xl:mt-24"
        noValidate
        onSubmit={handleSignUp}
      >
        <div className="mb-4 md:mb-6">
          <label htmlFor="signup-name" className="sr-only">
            Full name
          </label>
          <input
            id="signup-name"
            className="box-shadow-10 xl:box-shadow-20 w-full appearance-none rounded-lg bg-white px-4 py-2 text-base text-magenta focus:outline-none md:px-6 xl:px-8 xl:py-3 xl:text-xl"
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
            className="box-shadow-10 xl:box-shadow-20 w-full appearance-none rounded-lg bg-white px-4 py-2 text-base text-magenta focus:outline-none md:px-6 xl:px-8 xl:py-3 xl:text-xl"
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
            className="box-shadow-10 xl:box-shadow-20 w-full appearance-none rounded-lg bg-white px-4 py-2 text-base text-magenta focus:outline-none md:px-6 xl:px-8 xl:py-3 xl:text-xl"
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
            className="box-shadow-10 xl:box-shadow-20 w-full appearance-none rounded-lg bg-white px-4 py-2 text-base text-magenta focus:outline-none md:px-6 xl:px-8 xl:py-3 xl:text-xl"
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
          <div className="custom-control custom-checkbox mb-4 md:mb-6">
            <input
              className="custom-control-input"
              id="termsCheckbox"
              type="checkbox"
              name="tc_agreed"
              checked={tcAgreed}
              onChange={(e) => setTcAgreed(e.target.checked)}
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
          <div className="mb-2 w-1/2 md:mb-5">
            <div className="gallery__filter-county relative">
              <select
                className="box-shadow-10 w-full appearance-none rounded-lg bg-white px-4 py-1 text-sm text-magenta uppercase focus:outline-none md:px-6"
                title="Choose role"
                required={true}
                name="role"
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Choose role</option>
                {SIGNUP_ROLES.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="select__arrow pointer-events-none absolute top-0 right-0 bottom-0 flex items-center px-3 py-1 text-magenta md:pr-6">
                <svg className="h-3 w-auto fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5">
                  <path d="M2 0L0 2h4zm0 5L0 3h4z"></path>
                </svg>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 w-full appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
        >
          <span>{isSubmitting ? 'Creating account...' : 'Create an account'}</span>
        </button>
      </form>

      <br />

      <div className="mb-4 flex w-full items-center justify-center md:mb-6">
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
