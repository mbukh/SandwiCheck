import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from '@tanstack/react-router';

import { ROUTE_PATHS } from '../../routes/routes-config';
import * as apiAuth from '../../services/api-auth';
import useToast from '../../hooks/use-toast';
import Loading from '../Loading';
import validateForm from '../../utils/validate-utils';
import { isAuthRoute } from '../../utils/auth-utils';

function ResetPassword() {
  const parameters = useParams({ strict: false });
  const token = parameters?.token;
  const { showToast, toastComponents } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    const errorMessages = validateForm({ password: newPassword, confirmPassword });
    if (errorMessages.length > 0) {
      showToast(errorMessages[0]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiAuth.resetPassword({ newPassword, resetToken: token });
      if (res.success) {
        setSuccess(true);
      } else {
        // Check for token-related errors (401 Unauthorized)
        const errorStatus = res.error?.status;
        let errorMessage;
        errorMessage =
          errorStatus === 401
            ? 'The reset link you used is invalid or has expired. Reset links are valid for 1 hour.'
            : res.error?.message || res.message || 'Failed to reset password';
        setError(errorMessage);
        showToast(errorMessage);
      }
    } catch {
      const errorMessage = 'Failed to reset password. Please try again.';
      setError(errorMessage);
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login max-w-screen-md text-white text-center mx-auto">
      <h1 className="text-magenta font-bold text-2xl md:text-4xl xl:text-5xl uppercase mb-3 md:mb-5">
        Sandwich creativity with SandwiCheck!
      </h1>
      <h4 className="text-base md:text-xl xl:text-3xl mb-8 md:mb-10">Reset Your Password</h4>

      {loading && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <Loading />
          <p className="text-base md:text-xl xl:text-2xl mt-4">Resetting your password...</p>
        </div>
      )}

      {!loading && success && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <div className="flex flex-col items-center">
            <div className="mb-6 md:mb-8 xl:mb-10">
              <svg
                className="mx-auto h-12 w-12 md:h-16 md:w-16 xl:h-20 xl:w-20 text-yellow mb-4 md:mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-magenta font-bold text-xl md:text-2xl xl:text-3xl uppercase mb-3 md:mb-4">
                Password Reset Successfully!
              </h2>
              <p className="text-white text-base md:text-lg xl:text-xl font-normal max-w-md mx-auto leading-relaxed">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>
            <button
              onClick={() => {
                // Don't set returnTo if current path is an auth route
                // User should be redirected to /menu after login from auth pages
                const currentPath = location.pathname;
                const searchParams = isAuthRoute(currentPath) ? {} : { returnTo: currentPath };
                navigate({
                  to: ROUTE_PATHS.LOGIN,
                  search: searchParams
                });
              }}
              className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 transition-opacity hover:opacity-90"
            >
              Log In
            </button>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <div className="flex flex-col items-center">
            <div className="mb-6 md:mb-8 xl:mb-10">
              <svg
                className="mx-auto h-12 w-12 md:h-16 md:w-16 xl:h-20 xl:w-20 text-magenta mb-4 md:mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h2 className="text-magenta font-bold text-xl md:text-2xl xl:text-3xl uppercase mb-3 md:mb-4">
                Invalid or Expired Reset Link
              </h2>
              <p className="text-white text-base md:text-lg xl:text-xl font-normal max-w-md mx-auto leading-relaxed mb-2">
                The reset link you used is invalid or has expired. Reset links are valid for 1 hour.
              </p>
              <p className="text-white text-sm md:text-base xl:text-lg font-normal max-w-md mx-auto leading-relaxed opacity-90">
                Please request a new password reset link from the forgot password page.
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.FORGOT_PASSWORD}
              className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 transition-opacity hover:opacity-90"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      )}

      {!loading && !success && !error && (
        <form className="needs-validation text-left text-sm mt-15 md:mt-20 xl:mt-24 md:px-5" noValidate onSubmit={handleSubmit}>
          <div className="mb-4 md:mb-6">
            <label htmlFor="reset-password-new" className="sr-only">
              New password
            </label>
            <input
              id="reset-password-new"
              className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="mb-4 md:mb-6">
            <label htmlFor="reset-password-confirm" className="sr-only">
              Confirm new password
            </label>
            <input
              id="reset-password-confirm"
              className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
          </button>
        </form>
      )}

      {toastComponents}
    </div>
  );
}

export default ResetPassword;
