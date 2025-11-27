import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from '@tanstack/react-router';
import useToast from '../../hooks/use-toast';
import { ROUTE_PATHS } from '../../routes';
import * as apiAuth from '../../services/api-auth';
import { isAuthRoute } from '../../utils/auth-utils';
import validateForm from '../../utils/validate-utils';
import Loading from '../Loading';

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
    <div className="login mx-auto max-w-screen-md text-center text-white">
      <h1 className="mb-3 text-2xl font-bold text-magenta uppercase md:mb-5 md:text-4xl xl:text-5xl">
        Sandwich creativity with SandwiCheck!
      </h1>
      <h4 className="mb-8 text-base md:mb-10 md:text-xl xl:text-3xl">Reset Your Password</h4>

      {loading && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <Loading />
          <p className="mt-4 text-base md:text-xl xl:text-2xl">Resetting your password...</p>
        </div>
      )}

      {!loading && success && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <div className="flex flex-col items-center">
            <div className="mb-6 md:mb-8 xl:mb-10">
              <svg
                className="text-yellow mx-auto mb-4 h-12 w-12 md:mb-6 md:h-16 md:w-16 xl:h-20 xl:w-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="mb-3 text-xl font-bold text-magenta uppercase md:mb-4 md:text-2xl xl:text-3xl">
                Password Reset Successfully!
              </h2>
              <p className="mx-auto max-w-md text-base leading-relaxed font-normal text-white md:text-lg xl:text-xl">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>
            <button
              onClick={() => {
                /*
                 * Don't set returnTo if current path is an auth route
                 * User should be redirected to /menu after login from auth pages
                 */
                const currentPath = location.pathname;
                const searchParams = isAuthRoute(currentPath) ? {} : { returnTo: currentPath };
                navigate({
                  to: ROUTE_PATHS.LOGIN,
                  search: searchParams,
                });
              }}
              className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase transition-opacity hover:opacity-90 focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
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
                className="mx-auto mb-4 h-12 w-12 text-magenta md:mb-6 md:h-16 md:w-16 xl:h-20 xl:w-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h2 className="mb-3 text-xl font-bold text-magenta uppercase md:mb-4 md:text-2xl xl:text-3xl">
                Invalid or Expired Reset Link
              </h2>
              <p className="mx-auto mb-2 max-w-md text-base leading-relaxed font-normal text-white md:text-lg xl:text-xl">
                The reset link you used is invalid or has expired. Reset links are valid for 1 hour.
              </p>
              <p className="mx-auto max-w-md text-sm leading-relaxed font-normal text-white opacity-90 md:text-base xl:text-lg">
                Please request a new password reset link from the forgot password page.
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.FORGOT_PASSWORD}
              className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase transition-opacity hover:opacity-90 focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      )}

      {!loading && !success && !error && (
        <form
          className="needs-validation mt-15 text-left text-sm md:mt-20 md:px-5 xl:mt-24"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="mb-4 md:mb-6">
            <label htmlFor="reset-password-new" className="sr-only">
              New password
            </label>
            <input
              id="reset-password-new"
              className="box-shadow-10 xl:box-shadow-20 w-full appearance-none rounded-lg bg-white px-4 py-2 text-base text-magenta focus:outline-none md:px-6 xl:px-8 xl:py-3 xl:text-xl"
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
              className="box-shadow-10 xl:box-shadow-20 w-full appearance-none rounded-lg bg-white px-4 py-2 text-base text-magenta focus:outline-none md:px-6 xl:px-8 xl:py-3 xl:text-xl"
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
            className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 w-full appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
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
