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

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const res = await apiAuth.confirmEmail(token);
        if (res.success) {
          setSuccess(true);
          showToast(res.message || 'Email confirmed successfully!');
        } else {
          const errorMessage = res.error?.message || res.message || 'Failed to confirm email';
          setError(errorMessage);
          showToast(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to confirm email. Please try again.';
        setError(errorMessage);
        showToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, showToast]);

  return (
    <div className="login max-w-screen-md text-white text-center mx-auto">
      <h1 className="text-magenta font-bold text-2xl md:text-4xl xl:text-5xl uppercase mb-3 md:mb-5">
        Email Confirmation
      </h1>

      {loading && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <Loading />
          <p className="text-base md:text-xl xl:text-3xl mt-4">Confirming your email...</p>
        </div>
      )}

      {!loading && success && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <h4 className="text-base md:text-xl xl:text-3xl mb-4 md:mb-6">
            Email confirmed successfully! You can now log in.
          </h4>
          <Link
            to={ROUTE_PATHS.LOGIN}
            className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20"
          >
            Log In
          </Link>
        </div>
      )}

      {!loading && error && (
        <div className="mt-15 md:mt-20 xl:mt-24">
          <h4 className="text-base md:text-xl xl:text-3xl mb-4 md:mb-6 text-red-500">{error}</h4>
          {error.includes('Maximum number') || error.includes('max resends') || error.includes('contact support') ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-base md:text-xl mb-4 md:mb-6">
                You have reached the maximum number of confirmation email resends. Please contact support for
                assistance.
              </p>
              <Link
                to={ROUTE_PATHS.LOGIN}
                className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-base md:text-xl mb-4 md:mb-6">
                The confirmation link may have expired or is invalid.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Link
                  to={ROUTE_PATHS.LOGIN}
                  className="inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20"
                >
                  Go to Login
                </Link>
                <p className="text-sm md:text-base">
                  You can request a new confirmation email from the login page.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {toastComponents}
    </div>
  );
}

