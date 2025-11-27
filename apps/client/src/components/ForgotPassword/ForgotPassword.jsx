import { useState } from 'react';
import { Link, useLocation, useSearch } from '@tanstack/react-router';
import useToast from '../../hooks/use-toast';
import { ROUTE_PATHS } from '../../routes';
import * as apiAuth from '../../services/api-auth';
import { isAuthRoute } from '../../utils/auth-utils';
import validateForm from '../../utils/validate-utils';

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
    <div className="__login mx-auto max-w-3xl text-center text-white">
      <h1 className="mb-3 text-2xl font-bold text-magenta uppercase md:mb-5 md:text-4xl xl:text-5xl">
        Sandwich creativity with SandwiCheck!
      </h1>
      <h4 className="text-base md:text-xl xl:text-3xl">Reset your password</h4>

      {success ? (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <div className="flex flex-col items-center">
            <div className="mb-6 md:mb-8 xl:mb-10">
              <svg
                className="text-yellow mx-auto mb-4 h-12 w-12 md:mb-6 md:h-16 md:w-16 xl:h-20 xl:w-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="mb-3 text-xl font-bold text-magenta uppercase md:mb-4 md:text-2xl xl:text-3xl">
                Reset Email Sent
              </h2>
              <p className="mb-4 text-base md:text-xl xl:text-3xl">
                If an account exists with this email, a password reset link has been sent. Please check your inbox and
                spam folder.
              </p>
              <p className="mb-4 text-sm md:text-base xl:text-lg">
                The reset link will expire in 1 hour. If you don&apos;t receive the email, please check your spam folder
                or try again.
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.LOGIN}
              search={returnTo ? { returnTo } : {}}
              className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
            >
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mx-auto mb-6 max-w-lg text-sm md:mb-8 md:text-base xl:text-lg">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <form
            className="needs-validation mt-15 text-left text-sm md:mt-20 md:px-5 xl:mt-24"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="mb-4 md:mb-6">
              <label htmlFor="forgot-password-email" className="sr-only">
                Email address
              </label>
              <input
                id="forgot-password-email"
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

            <button
              type="submit"
              disabled={loading}
              className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 w-full appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
            >
              <span>{loading ? 'Sending...' : 'Send Reset Email'}</span>
            </button>
          </form>

          <br />

          <div className="mb-4 flex w-full items-center justify-center md:mb-6">
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
