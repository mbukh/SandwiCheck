import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ERROR_CODE } from '@sandwicheck/shared';
import Loading from '@/components/Loading';
import { ROUTE_PATHS } from '@/constants/route-paths';
import useToast from '@/hooks/use-toast';
import * as apiAuth from '@/services/api-auth';

export const Route = createFileRoute('/confirm-email/$token')({
  component: ConfirmEmail,
});

function ConfirmEmail(): React.JSX.Element {
  const { token } = Route.useParams();
  const { showToast, toastComponents } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | number | null>(null); // ERROR_CODE value (tokenExpired | tokenInvalid | maxResends) | null

  useEffect(() => {
    const confirmEmail = async (): Promise<void> => {
      try {
        const res = await apiAuth.confirmEmail(token);
        if (res.success) {
          setSuccess(true);
          showToast(res.message || 'Email confirmed successfully!');
        } else {
          const errorMessage = res.error?.message || res.message || 'Failed to confirm email';
          const errorCode = res.error?.code;
          setError(errorMessage);
          setErrorType(errorCode ?? null);
          showToast(errorMessage);
        }
      } catch (error_) {
        const errorMessage = error_ instanceof Error ? error_.message : 'Failed to confirm email. Please try again.';
        setError(errorMessage);
        setErrorType(null);
        showToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void confirmEmail();
  }, [token, showToast]);

  return (
    <div className="login mx-auto max-w-screen-md pb-12 text-center text-white md:pb-16 lg:pb-20">
      <h1 className="text-shadow-10 mb-3 text-center text-lg uppercase md:mb-5">Email Confirmation</h1>
      <h4 className="mb-8 text-base md:mb-10 md:text-xl xl:text-2xl">Confirm your email to activate your account</h4>

      {loading && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <Loading />
          <p className="mt-4 text-base md:text-xl xl:text-2xl">Confirming your email...</p>
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
                Email Confirmed Successfully!
              </h2>
              <p className="mx-auto max-w-md text-base leading-relaxed font-normal text-white md:text-lg xl:text-xl">
                Your email has been verified. You can now log in to your account and start creating delicious
                sandwiches!
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase transition-opacity hover:opacity-90 focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
            >
              Log In
            </Link>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          {errorType === ERROR_CODE.maxResends ||
          error.includes('Maximum number') ||
          error.includes('max resends') ||
          error.includes('contact support') ? (
            <div className="flex flex-col items-center">
              <div className="mb-6 md:mb-8 xl:mb-10">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-magenta md:mb-6 md:h-16 md:w-16 xl:h-20 xl:w-20"
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
                <h2 className="mb-3 text-xl font-bold text-magenta uppercase md:mb-4 md:text-2xl xl:text-3xl">
                  Maximum Resend Limit Reached
                </h2>
                <p className="mx-auto max-w-md text-base leading-relaxed font-normal text-white md:text-lg xl:text-xl">
                  You have reached the maximum number of confirmation email resends. Please contact support for
                  assistance.
                </p>
              </div>
              <Link
                to={ROUTE_PATHS.LOGIN}
                className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase transition-opacity hover:opacity-90 focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
              >
                Go to Login
              </Link>
            </div>
          ) : errorType === ERROR_CODE.tokenExpired ? (
            <div className="flex flex-col items-center">
              <div className="mb-6 md:mb-8 xl:mb-10">
                <svg
                  className="text-yellow mx-auto mb-4 h-12 w-12 md:mb-6 md:h-16 md:w-16 xl:h-20 xl:w-20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-yellow mb-3 text-xl font-bold uppercase md:mb-4 md:text-2xl xl:text-3xl">
                  Confirmation Link Expired
                </h2>
                <p className="mx-auto mb-2 max-w-md text-base leading-relaxed font-normal text-white md:text-lg xl:text-xl">
                  {error || 'This confirmation link has expired and is no longer valid.'}
                </p>
                <p className="mx-auto max-w-md text-sm leading-relaxed font-normal text-white opacity-90 md:text-base xl:text-lg">
                  Confirmation links are valid for a limited time. Please request a new confirmation email to verify
                  your account.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Link
                  to={ROUTE_PATHS.LOGIN}
                  className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase transition-opacity hover:opacity-90 focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
                >
                  Go to Login
                </Link>
                <p className="text-xs text-white opacity-75 md:text-sm xl:text-base">
                  You can request a new confirmation email from the login page.
                </p>
              </div>
            </div>
          ) : errorType === ERROR_CODE.tokenInvalid ? (
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
                  Invalid Confirmation Link
                </h2>
                <p className="mx-auto mb-2 max-w-md text-base leading-relaxed font-normal text-white md:text-lg xl:text-xl">
                  {error || 'The confirmation link you used is invalid or has been corrupted.'}
                </p>
                <p className="mx-auto max-w-md text-sm leading-relaxed font-normal text-white opacity-90 md:text-base xl:text-lg">
                  Please check your email for the correct confirmation link, or request a new one from the login page.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Link
                  to={ROUTE_PATHS.LOGIN}
                  className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase transition-opacity hover:opacity-90 focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
                >
                  Go to Login
                </Link>
                <p className="text-xs text-white opacity-75 md:text-sm xl:text-base">
                  You can request a new confirmation email from the login page.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-6 md:mb-8 xl:mb-10">
                <svg
                  className="text-yellow mx-auto mb-4 h-12 w-12 md:mb-6 md:h-16 md:w-16 xl:h-20 xl:w-20"
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
                <h2 className="text-yellow mb-3 text-xl font-bold uppercase md:mb-4 md:text-2xl xl:text-3xl">
                  Confirmation Failed
                </h2>
                <p className="mx-auto max-w-md text-base leading-relaxed font-normal text-white md:text-lg xl:text-xl">
                  {error || 'An error occurred while confirming your email. Please try again.'}
                </p>
              </div>
              <Link
                to={ROUTE_PATHS.LOGIN}
                className="box-shadow-10 xl:box-shadow-20 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase transition-opacity hover:opacity-90 focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base xl:h-14 xl:px-8 xl:text-xl"
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
