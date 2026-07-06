import { useCallback, useEffect, useRef, useState } from 'react';
import { ERROR_CODE } from '@sandwicheck/shared';
import * as apiAuth from '@/services/api-auth';

const MAX_RESENDS_MESSAGE =
  'Maximum number of confirmation email resends reached. Please contact support for assistance.';

export interface UseResendConfirmationResult {
  /** Resend the confirmation email for `email`; drives the state below. */
  resend: (email: string) => Promise<void>;
  /** True while a resend request is in flight (disable the button). */
  resending: boolean;
  /** Remaining cooldown in ms (from a 429), counted down to null; show a "wait N" message + disable. */
  cooldownRemainingMs: number | null;
  /** True after a resend succeeded; show the inline confirmation instead of the button. */
  emailSentSuccessfully: boolean;
  /** True once the server reports the resend cap (403 MAX_RESENDS); stop offering the button. */
  maxResendsReached: boolean;
  /** Clear the success/cap display state so the affordance can be offered again. */
  reset: () => void;
}

/**
 * Shared "resend confirmation email" behaviour for the Login page and the signup-pending screen.
 *
 * Encapsulates the resend request and its three response signals — success, the 429 cooldown
 * countdown (with timer + cleanup), and the 403 resend cap — so both call sites stay in lockstep
 * instead of duplicating this security-relevant handling. The caller owns when the affordance is
 * shown and passes its own `showToast` so messages render in its toast portal.
 */
const useResendConfirmation = (showToast: (message: string) => void): UseResendConfirmationResult => {
  const [resending, setResending] = useState(false);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number | null>(null);
  const [emailSentSuccessfully, setEmailSentSuccessfully] = useState(false);
  const [maxResendsReached, setMaxResendsReached] = useState(false);
  const cooldownIntervalReference = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick the cooldown down to null, then clear the interval.
  useEffect(() => {
    if (cooldownRemainingMs === null || cooldownRemainingMs <= 0) {
      if (cooldownIntervalReference.current) {
        clearInterval(cooldownIntervalReference.current);
        cooldownIntervalReference.current = null;
      }
      return;
    }

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
  }, [cooldownRemainingMs]);

  // Clear any running timer on unmount.
  useEffect(() => {
    return () => {
      if (cooldownIntervalReference.current) {
        clearInterval(cooldownIntervalReference.current);
        cooldownIntervalReference.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    setEmailSentSuccessfully(false);
    setMaxResendsReached(false);
  }, []);

  const resend = useCallback(
    async (email: string): Promise<void> => {
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
          setCooldownRemainingMs(null);
          // No toast - message is shown inline instead
        } else {
          // Handle error response (res.success === false or res.error exists)
          const errorStatus = res?.error?.status;
          const errorCode = res?.error?.code;
          const errorMessage = res?.error?.message || res?.message || 'Failed to send confirmation email';
          const cooldownMs = res?.error?.cooldownRemainingMs;

          // Rate limited (429): show the cooldown countdown.
          if (errorStatus === 429) {
            if (cooldownMs !== undefined && cooldownMs > 0) {
              setCooldownRemainingMs(cooldownMs);
            }
            showToast(errorMessage);
          }
          // Resend cap reached (MAX_RESENDS): stop offering the resend button.
          else if (errorCode === ERROR_CODE.maxResends) {
            showToast(MAX_RESENDS_MESSAGE);
            setMaxResendsReached(true);
            setCooldownRemainingMs(null);
          }
          // Generic error
          else {
            showToast(errorMessage);
          }
        }
      } catch (error) {
        // Handle unexpected errors (network errors, etc.)
        const response =
          error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { status?: number; data?: unknown } }).response
            : undefined;
        const errorStatus = response?.status;
        const errorData = response?.data as
          | { error?: { message?: string; code?: string | number; cooldownRemainingMs?: number }; message?: string }
          | undefined;
        const errorCode = errorData?.error?.code;
        const errorMessage =
          errorData?.error?.message || errorData?.message || 'Failed to send confirmation email. Please try again.';
        const cooldownMs = errorData?.error?.cooldownRemainingMs;

        // Rate limited (429): show the cooldown countdown.
        if (errorStatus === 429) {
          if (cooldownMs !== undefined && cooldownMs > 0) {
            setCooldownRemainingMs(cooldownMs);
          }
          showToast(errorMessage);
        }
        // Resend cap reached (MAX_RESENDS): stop offering the resend button.
        else if (errorCode === ERROR_CODE.maxResends) {
          showToast(MAX_RESENDS_MESSAGE);
          setMaxResendsReached(true);
          setCooldownRemainingMs(null);
        }
        // Generic error
        else {
          showToast(errorMessage);
        }
      } finally {
        setResending(false);
      }
    },
    [showToast],
  );

  return { resend, resending, cooldownRemainingMs, emailSentSuccessfully, maxResendsReached, reset };
};

export default useResendConfirmation;
