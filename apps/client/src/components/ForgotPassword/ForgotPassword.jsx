import { useState } from 'react';
import { Link, useSearch, useLocation } from '@tanstack/react-router';

import { ROUTE_PATHS } from '../../routes';
import * as apiAuth from '../../services/api-auth';
import useToast from '../../hooks/use-toast';
import validateForm from '../../utils/validate-utils';
import { isAuthRoute } from '../../utils/auth-utils';

function ForgotPassword() {
  const { showToast, toastComponents } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const search = useSearch({ strict: false });
  const location = useLocation();

  // Determine returnTo value (same logic as Login/Signup components)
  const returnTo = search?.returnTo || (isAuthRoute(location.pathname) ? null : location.pathname);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const errorMessages = validateForm({ email });
    if (errorMessages.length > 0) {
      showToast(errorMessages[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await apiAuth.forgotPassword({ email });
      if (res.success) {
        setSuccess(true);
      } else {
        showToast(res.error?.message || res.message || 'Failed to send reset email');
      }
    } catch {
      showToast('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login max-w-screen-md text-white text-center mx-auto">
      <h1 className="text-magenta font-bold text-2xl md:text-4xl xl:text-5xl uppercase mb-3 md:mb-5">
        Sandwich creativity with SandwiCheck!
      </h1>
      <h4 className="text-base md:text-xl xl:text-3xl">Reset your password</h4>

      {success ? (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <div className="flex flex-col items-center">
            <div className="mb-6 md:mb-8 xl:mb-10">
              <svg
                className="mx-auto h-12 w-12 md:h-16 md:w-16 xl:h-20 xl:w-20 text-yellow mb-4 md:mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-magenta font-bold text-xl md:text-2xl xl:text-3xl uppercase mb-3 md:mb-4">
                Reset Email Sent
              </h2>
              <p className="text-base md:text-xl xl:text-3xl mb-4">
                If an account exists with this email, a password reset link has been sent. Please check your inbox and
                spam folder.
              </p>
              <p className="text-sm md:text-base xl:text-lg mb-4">
                The reset link will expire in 1 hour. If you don&apos;t receive the email, please check your spam folder
                or try again.
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.LOGIN}
              search={returnTo ? { returnTo } : {}}
              className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20"
            >
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm md:text-base xl:text-lg mb-6 md:mb-8 max-w-lg mx-auto">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <form
            className="needs-validation text-left text-sm mt-15 md:mt-20 xl:mt-24 md:px-5"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="mb-4 md:mb-6">
              <label htmlFor="forgot-password-email" className="sr-only">
                Email address
              </label>
              <input
                id="forgot-password-email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Sending...' : 'Send Reset Email'}</span>
            </button>
          </form>

          <br />

          <div className="w-full mb-4 md:mb-6 flex justify-center items-center">
            Remember your password?
            <Link className="mx-2 underline" to={ROUTE_PATHS.LOGIN} search={returnTo ? { returnTo } : {}}>
              Log in
            </Link>
          </div>
        </>
      )}

      {toastComponents}
    </div>
  );
}

export default ForgotPassword;
