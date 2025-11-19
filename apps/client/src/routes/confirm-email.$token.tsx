import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import { ROUTE_PATHS } from './routes-config';
import * as apiAuth from '../services/api-auth';
import useToast from '../hooks/use-toast';
import Loading from '../components/Loading';

export const Route = createFileRoute('/confirm-email/$token')({
  component: ConfirmEmail,
});

export const ConfirmEmailRoute = Route;

function ConfirmEmail() {
  const { token } = Route.useParams();
  const { showToast, toastComponents } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'MAX_RESENDS' | null

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const res = await apiAuth.confirmEmail(token);
        if (res.success) {
          setSuccess(true);
          showToast(res.message || 'Email confirmed successfully!');
        } else {
          const errorMessage = res.error?.message || res.message || 'Failed to confirm email';
          const errorCode = res.error?.code;
          setError(errorMessage);
          setErrorType(errorCode);
          showToast(errorMessage);
        }
      } catch (err) {
        const errorData = err.response?.data?.error || {};
        const errorMessage =
          errorData.message || err.response?.data?.message || 'Failed to confirm email. Please try again.';
        const errorCode = errorData.code;
        setError(errorMessage);
        setErrorType(errorCode);
        showToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, showToast]);

  return (
    <div className="login max-w-screen-md text-white text-center mx-auto pb-12 md:pb-16 lg:pb-20">
      <h1 className="text-center text-l uppercase text-shadow-10 mb-3 md:mb-5">Email Confirmation</h1>
      <h4 className="text-base md:text-xl xl:text-2xl mb-8 md:mb-10">Confirm your email to activate your account</h4>

      {loading && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <Loading />
          <p className="text-base md:text-xl xl:text-2xl mt-4">Confirming your email...</p>
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
                Email Confirmed Successfully!
              </h2>
              <p className="text-white text-base md:text-lg xl:text-xl font-normal max-w-md mx-auto leading-relaxed">
                Your email has been verified. You can now log in to your account and start creating delicious
                sandwiches!
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 transition-opacity hover:opacity-90"
            >
              Log In
            </Link>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          {errorType === 'MAX_RESENDS' ||
          error.includes('Maximum number') ||
          error.includes('max resends') ||
          error.includes('contact support') ? (
            <div className="flex flex-col items-center">
              <div className="mb-6 md:mb-8 xl:mb-10">
                <svg
                  className="mx-auto h-12 w-12 md:h-16 md:w-16 xl:h-20 xl:w-20 text-magenta mb-4 md:mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h2 className="text-magenta font-bold text-xl md:text-2xl xl:text-3xl uppercase mb-3 md:mb-4">
                  Maximum Resend Limit Reached
                </h2>
                <p className="text-white text-base md:text-lg xl:text-xl font-normal max-w-md mx-auto leading-relaxed">
                  You have reached the maximum number of confirmation email resends. Please contact support for
                  assistance.
                </p>
              </div>
              <Link
                to={ROUTE_PATHS.LOGIN}
                className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 transition-opacity hover:opacity-90"
              >
                Go to Login
              </Link>
            </div>
          ) : errorType === 'TOKEN_EXPIRED' ? (
            <div className="flex flex-col items-center">
              <div className="mb-6 md:mb-8 xl:mb-10">
                <svg
                  className="mx-auto h-12 w-12 md:h-16 md:w-16 xl:h-20 xl:w-20 text-yellow mb-4 md:mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-yellow font-bold text-xl md:text-2xl xl:text-3xl uppercase mb-3 md:mb-4">
                  Confirmation Link Expired
                </h2>
                <p className="text-white text-base md:text-lg xl:text-xl font-normal max-w-md mx-auto leading-relaxed mb-2">
                  {error || 'This confirmation link has expired and is no longer valid.'}
                </p>
                <p className="text-white text-sm md:text-base xl:text-lg font-normal max-w-md mx-auto leading-relaxed opacity-90">
                  Confirmation links are valid for a limited time. Please request a new confirmation email to verify
                  your account.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Link
                  to={ROUTE_PATHS.LOGIN}
                  className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 transition-opacity hover:opacity-90"
                >
                  Go to Login
                </Link>
                <p className="text-white text-xs md:text-sm xl:text-base opacity-75">
                  You can request a new confirmation email from the login page.
                </p>
              </div>
            </div>
          ) : errorType === 'TOKEN_INVALID' ? (
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
                  Invalid Confirmation Link
                </h2>
                <p className="text-white text-base md:text-lg xl:text-xl font-normal max-w-md mx-auto leading-relaxed mb-2">
                  {error || 'The confirmation link you used is invalid or has been corrupted.'}
                </p>
                <p className="text-white text-sm md:text-base xl:text-lg font-normal max-w-md mx-auto leading-relaxed opacity-90">
                  Please check your email for the correct confirmation link, or request a new one from the login page.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Link
                  to={ROUTE_PATHS.LOGIN}
                  className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 transition-opacity hover:opacity-90"
                >
                  Go to Login
                </Link>
                <p className="text-white text-xs md:text-sm xl:text-base opacity-75">
                  You can request a new confirmation email from the login page.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-6 md:mb-8 xl:mb-10">
                <svg
                  className="mx-auto h-12 w-12 md:h-16 md:w-16 xl:h-20 xl:w-20 text-yellow mb-4 md:mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-yellow font-bold text-xl md:text-2xl xl:text-3xl uppercase mb-3 md:mb-4">
                  Confirmation Failed
                </h2>
                <p className="text-white text-base md:text-lg xl:text-xl font-normal max-w-md mx-auto leading-relaxed">
                  {error || 'An error occurred while confirming your email. Please try again.'}
                </p>
              </div>
              <Link
                to={ROUTE_PATHS.LOGIN}
                className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20 transition-opacity hover:opacity-90"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      )}

      {toastComponents}
    </div>
  );
}
