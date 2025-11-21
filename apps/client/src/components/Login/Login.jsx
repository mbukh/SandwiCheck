import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearch, useLocation } from '@tanstack/react-router';

import { ROUTE_PATHS } from '../../routes';
import useForm from '../../hooks/use-form';
import useToast from '../../hooks/use-toast';
import * as apiAuth from '../../services/api-auth';
import { isAuthRoute } from '../../utils/auth-utils';
import { useAuthGlobalContext } from '../../context/AuthGlobalContext';
import { readSandwichFromCache } from '../../services/api-sandwiches';

const Login = () => {
  const { showToast, toastComponents } = useToast();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const location = useLocation();
  const { email, setEmail, password, setPassword, LoginHandler, parentId, errors } = useForm();
  const { currentUser, isCurrentUserReady } = useAuthGlobalContext();

  /*
   * Determine returnTo value:
   * If returnTo exists in search → use it
   * Else if current pathname is NOT an auth route → use location.pathname
   * Else → use null (will redirect to /menu)
   */
  const returnTo = search?.returnTo || (isAuthRoute(location.pathname) ? null : location.pathname);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [emailSentSuccessfully, setEmailSentSuccessfully] = useState(false);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(null);
  const cooldownIntervalReference = useRef(null);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isCurrentUserReady && currentUser && Object.keys(currentUser).length > 0) {
      // User is authenticated, redirect them
      const returnTo = search?.returnTo;
      let destination;
      if (returnTo && returnTo.trim() && !isAuthRoute(returnTo)) {
        destination = returnTo;
      } else {
        const unExpiredSavedSandwich = readSandwichFromCache();
        destination = unExpiredSavedSandwich ? ROUTE_PATHS.CREATE : ROUTE_PATHS.MENU;
      }
      navigate({ to: destination, replace: true });
    }
  }, [currentUser, isCurrentUserReady, navigate, search]);

  useEffect(() => {
    for (const error of errors) {
      showToast(error);
      // Check if error is about email confirmation
      if (error && error.includes('confirm your email')) {
        setShowResendConfirmation(true);
        setEmailSentSuccessfully(false); // Reset success state when showing resend button
      } else {
        setShowResendConfirmation(false);
      }
    }
  }, [errors, showToast]);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldownRemainingMs !== null && cooldownRemainingMs > 0) {
      cooldownIntervalReference.current = setInterval(() => {
        setCooldownRemainingMs((previous) => {
          if (previous === null || previous <= 0) {
            return null;
          }
          const newValue = previous - 1000;
          return newValue <= 0 ? null : newValue;
        });
      }, 1000);

      return () => {
        if (cooldownIntervalReference.current) {
          clearInterval(cooldownIntervalReference.current);
          cooldownIntervalReference.current = null;
        }
      };
    } else {
      if (cooldownIntervalReference.current) {
        clearInterval(cooldownIntervalReference.current);
        cooldownIntervalReference.current = null;
      }
    }
  }, [cooldownRemainingMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalReference.current) {
        clearInterval(cooldownIntervalReference.current);
        cooldownIntervalReference.current = null;
      }
    };
  }, []);

  // Format cooldown time for display
  const formatCooldownTime = (ms) => {
    if (ms === null || ms <= 0) return null;
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return seconds > 0
        ? `${minutes} minute${minutes === 1 ? '' : 's'} and ${seconds} second${seconds === 1 ? '' : 's'}`
        : `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      showToast('Please enter your email address first');
      return;
    }

    setResending(true);
    setEmailSentSuccessfully(false);
    setCooldownRemainingMs(null); // Reset cooldown
    try {
      const res = await apiAuth.resendConfirmation(email);
      // Check if response indicates success
      if (res && res.success === true) {
        // Email sent successfully
        setEmailSentSuccessfully(true);
        setShowResendConfirmation(false);
        setCooldownRemainingMs(null);
        // No toast - message is shown inline instead
      } else {
        // Handle error response (res.success === false or res.error exists)
        const errorStatus = res?.error?.status;
        const errorMessage = res?.error?.message || res?.message || 'Failed to send confirmation email';
        const cooldownMs = res?.error?.cooldownRemainingMs;

        // Check for rate limit (429) with cooldown
        if (errorStatus === 429 || errorMessage.includes('Too many') || errorMessage.includes('wait')) {
          if (cooldownMs !== undefined && cooldownMs > 0) {
            setCooldownRemainingMs(cooldownMs);
          }
          showToast(errorMessage);
        }
        // Check for max resend count reached (403)
        else if (
          errorStatus === 403 ||
          errorMessage.includes('Maximum number') ||
          errorMessage.includes('max resends')
        ) {
          showToast('Maximum number of confirmation email resends reached. Please contact support for assistance.');
          setShowResendConfirmation(false);
          setCooldownRemainingMs(null);
        }
        // Generic error
        else {
          showToast(errorMessage);
        }
      }
    } catch (error) {
      // Handle unexpected errors (network errors, etc.)
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.error?.message || errorData?.message || 'Failed to send confirmation email. Please try again.';
      const cooldownMs = errorData?.error?.cooldownRemainingMs;

      // Check for rate limit (429) with cooldown
      if (errorStatus === 429 || errorMessage.includes('Too many') || errorMessage.includes('wait')) {
        if (cooldownMs !== undefined && cooldownMs > 0) {
          setCooldownRemainingMs(cooldownMs);
        }
        showToast(errorMessage);
      }
      // Check for max resend count reached (403)
      else if (errorStatus === 403 || errorMessage.includes('Maximum number') || errorMessage.includes('max resends')) {
        showToast('Maximum number of confirmation email resends reached. Please contact support for assistance.');
        setShowResendConfirmation(false);
        setCooldownRemainingMs(null);
      }
      // Generic error
      else {
        showToast(errorMessage);
      }
    } finally {
      setResending(false);
    }
  };

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
        onSubmit={async (e) => {
          e.preventDefault();
          setIsLoggingIn(true);
          try {
            await LoginHandler(e, returnTo);
          } finally {
            setIsLoggingIn(false);
          }
        }}
      >
        <div className="mb-4 md:mb-6">
          <label htmlFor="login-email" className="sr-only">
            Email address
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            id="login-password"
            className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
            name="password"
            type="password"
            autoComplete="current-password"
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

        <div className="mb-2 md:mb-4 text-right">
          <Link
            to={ROUTE_PATHS.FORGOT_PASSWORD}
            search={returnTo ? { returnTo } : {}}
            className="underline text-sm md:text-base"
          >
            Forgot Password?
          </Link>
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

        {emailSentSuccessfully ? (
          <div className="mb-4 md:mb-6 text-center">
            <p className="text-base md:text-xl text-yellow font-semibold">
              Please check your email to confirm your account.
            </p>
          </div>
        ) : showResendConfirmation ? (
          <div className="mb-4 md:mb-6 text-center">
            <p className="text-base md:text-xl mb-2">Need to resend the confirmation email?</p>
            {cooldownRemainingMs !== null && cooldownRemainingMs > 0 ? (
              <div className="mb-2">
                <p className="text-base md:text-lg text-yellow font-semibold">
                  Please wait {formatCooldownTime(cooldownRemainingMs)} before requesting another confirmation email.
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending || (cooldownRemainingMs !== null && cooldownRemainingMs > 0)}
              className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-yellow text-magenta h-8 md:h-10 xl:h-12 text-sm md:text-base xl:text-lg py-2 px-4 md:px-6 xl:box-shadow-20 disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Confirmation Email'}
            </button>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoggingIn ? 'Logging in...' : 'Log in'}</span>
        </button>
      </form>

      <br />

      <div className="w-full mb-4 md:mb-6 flex justify-center items-center">
        Don't have an account?
        {parentId ? (
          <Link
            className="mx-2 underline"
            to={ROUTE_PATHS.SIGNUP_PARENT}
            params={{ parentId }}
            search={returnTo ? { returnTo } : {}}
          >
            Sign up
          </Link>
        ) : (
          <Link className="mx-2 underline" to={ROUTE_PATHS.SIGNUP} search={returnTo ? { returnTo } : {}}>
            Sign up
          </Link>
        )}
      </div>
      {toastComponents}
    </div>
  );
};

export default Login;
