import { ERROR_CODE } from '@sandwicheck/shared';
import { act, renderHook } from '@testing-library/react';
import useResendConfirmation from '@/hooks/use-resend-confirmation';
import * as apiAuth from '@/services/api-auth';

vi.mock('@/services/api-auth', () => ({ resendConfirmation: vi.fn() }));

const resendMock = vi.mocked(apiAuth.resendConfirmation);

const renderResend = (): {
  result: { current: ReturnType<typeof useResendConfirmation> };
  showToast: ReturnType<typeof vi.fn>;
} => {
  const showToast = vi.fn();
  const { result } = renderHook(() => useResendConfirmation(showToast));
  return { result, showToast };
};

describe('useResendConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the API and warns when no email is supplied', async () => {
    const { result, showToast } = renderResend();

    await act(async () => {
      await result.current.resend('');
    });

    expect(resendMock).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('Please enter your email address first');
    expect(result.current.emailSentSuccessfully).toBe(false);
  });

  it('marks success (no toast) when the email is sent', async () => {
    resendMock.mockResolvedValue({ success: true });
    const { result, showToast } = renderResend();

    await act(async () => {
      await result.current.resend('user@example.com');
    });

    expect(resendMock).toHaveBeenCalledWith('user@example.com');
    expect(result.current.emailSentSuccessfully).toBe(true);
    expect(result.current.resending).toBe(false);
    // Success is shown inline by the consumer, not as a toast.
    expect(showToast).not.toHaveBeenCalled();
  });

  it('arms the cooldown countdown from a 429 response', async () => {
    resendMock.mockResolvedValue({
      success: false,
      error: {
        status: 429,
        message: 'Please wait 5 minutes before requesting another confirmation email.',
        cooldownRemainingMs: 300_000,
      },
    });
    const { result, showToast } = renderResend();

    await act(async () => {
      await result.current.resend('user@example.com');
    });

    expect(result.current.cooldownRemainingMs).toBe(300_000);
    expect(result.current.emailSentSuccessfully).toBe(false);
    expect(showToast).toHaveBeenCalledWith('Please wait 5 minutes before requesting another confirmation email.');
  });

  it('counts the cooldown down once per second', async () => {
    resendMock.mockResolvedValue({
      success: false,
      error: { status: 429, message: 'wait', cooldownRemainingMs: 3000 },
    });
    const { result } = renderResend();

    await act(async () => {
      await result.current.resend('user@example.com');
    });
    expect(result.current.cooldownRemainingMs).toBe(3000);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.cooldownRemainingMs).toBe(2000);
  });

  it('stops offering the button once the resend cap is reached (403)', async () => {
    resendMock.mockResolvedValue({
      success: false,
      error: { code: ERROR_CODE.maxResends, message: 'capped' },
    });
    const { result, showToast } = renderResend();

    await act(async () => {
      await result.current.resend('user@example.com');
    });

    expect(result.current.maxResendsReached).toBe(true);
    expect(showToast).toHaveBeenCalledWith(
      'Maximum number of confirmation email resends reached. Please contact support for assistance.',
    );
  });

  it('toasts a generic error without arming cooldown or cap', async () => {
    resendMock.mockResolvedValue({ success: false, error: { status: 500, message: 'Server is down' } });
    const { result, showToast } = renderResend();

    await act(async () => {
      await result.current.resend('user@example.com');
    });

    expect(showToast).toHaveBeenCalledWith('Server is down');
    expect(result.current.cooldownRemainingMs).toBeNull();
    expect(result.current.maxResendsReached).toBe(false);
  });

  it('reset() clears the success and cap display state', async () => {
    resendMock.mockResolvedValue({ success: true });
    const { result } = renderResend();

    await act(async () => {
      await result.current.resend('user@example.com');
    });
    expect(result.current.emailSentSuccessfully).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.emailSentSuccessfully).toBe(false);
    expect(result.current.maxResendsReached).toBe(false);
  });
});
