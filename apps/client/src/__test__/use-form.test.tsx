import { ERROR_CODE } from '@sandwicheck/shared';
import { act, renderHook } from '@testing-library/react';
import useForm from '@/hooks/use-form';

const signUpMock = vi.fn();
const logInMock = vi.fn();
const matchRouteMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useMatchRoute: () => matchRouteMock,
  useNavigate: () => vi.fn(),
}));

vi.mock('@/context/AuthGlobalContext', () => ({
  useAuthGlobalContext: () => ({ logIn: logInMock, signUp: signUpMock, currentUser: {} }),
}));

vi.mock('@/context/ModalContext', () => ({
  useModalContext: () => ({ closeActiveModal: () => false }),
}));

const fakeSubmitEvent = { preventDefault: () => {} } as React.FormEvent;

const fillValidFields = (result: { current: ReturnType<typeof useForm> }): void => {
  act(() => {
    result.current.setName('Kid Name');
    result.current.setEmail('kid@example.com');
    result.current.setPassword('secret1');
    result.current.setConfirmPassword('secret1');
  });
};

describe('useForm signUpHandler', () => {
  beforeEach(() => {
    signUpMock.mockReset();
    // The server signals a pending account via data.requiresEmailConfirmation, not message prose.
    signUpMock.mockResolvedValue({
      success: true,
      message: 'Please check your email to confirm your account',
      data: { requiresEmailConfirmation: true, emailSent: true },
    });
    matchRouteMock.mockReset();
  });

  it('sends role "child" when signing up through a parent invite link', async () => {
    // Simulate being on /signup/parent/$parentId
    matchRouteMock.mockImplementation(({ to }: { to: string }) =>
      to.includes('signup') ? { parentId: 'invite-token-123' } : false,
    );

    const { result } = renderHook(() => useForm());
    fillValidFields(result);

    await act(async () => {
      await result.current.signUpHandler(fakeSubmitEvent);
    });

    expect(signUpMock).toHaveBeenCalledWith({
      name: 'Kid Name',
      email: 'kid@example.com',
      password: 'secret1',
      role: 'child',
      inviteToken: 'invite-token-123',
    });
    expect(result.current.errors).toEqual([]);
  });

  it('rejects a regular signup client-side when no role is selected', async () => {
    matchRouteMock.mockReturnValue(false);

    const { result } = renderHook(() => useForm());
    fillValidFields(result);

    await act(async () => {
      await result.current.signUpHandler(fakeSubmitEvent);
    });

    expect(signUpMock).not.toHaveBeenCalled();
    expect(result.current.errors).toContain('Please select a valid role: either parent or child');
  });

  it('sends the selected role on a regular signup', async () => {
    matchRouteMock.mockReturnValue(false);

    const { result } = renderHook(() => useForm());
    fillValidFields(result);
    act(() => {
      result.current.setRole('parent');
    });

    await act(async () => {
      await result.current.signUpHandler(fakeSubmitEvent);
    });

    expect(signUpMock).toHaveBeenCalledWith(expect.objectContaining({ role: 'parent', inviteToken: undefined }));
  });

  it('returns emailSent: false when the account was created but the email failed', async () => {
    matchRouteMock.mockReturnValue(false);
    signUpMock.mockResolvedValue({
      success: true,
      message: 'Account created, but confirmation email could not be sent. Please use the resend confirmation option.',
      data: { requiresEmailConfirmation: true, emailSent: false },
    });

    const { result } = renderHook(() => useForm());
    fillValidFields(result);
    act(() => {
      result.current.setRole('parent');
    });

    let outcome!: Awaited<ReturnType<typeof result.current.signUpHandler>>;
    await act(async () => {
      outcome = await result.current.signUpHandler(fakeSubmitEvent);
    });

    expect(outcome).toEqual(expect.objectContaining({ needsEmailConfirmation: true, emailSent: false }));
  });
});

describe('useForm LoginHandler', () => {
  beforeEach(() => {
    logInMock.mockReset();
    matchRouteMock.mockReset();
    matchRouteMock.mockReturnValue(false);
  });

  const fillLogin = (result: { current: ReturnType<typeof useForm> }): void => {
    act(() => {
      result.current.setEmail('user@example.com');
      result.current.setPassword('secret1');
    });
  };

  it('flags email-not-confirmed when login is rejected with EMAIL_NOT_CONFIRMED', async () => {
    logInMock.mockResolvedValue({
      success: false,
      error: {
        status: 401,
        message: 'Please confirm your email before logging in',
        code: ERROR_CODE.emailNotConfirmed,
      },
    });

    const { result } = renderHook(() => useForm());
    fillLogin(result);

    await act(async () => {
      await result.current.LoginHandler(fakeSubmitEvent);
    });

    expect(result.current.loginNeedsEmailConfirmation).toBe(true);
    expect(result.current.errors).toEqual(['Please confirm your email before logging in']);
  });

  it('shows a generic error (flag stays false) for a code-less 401', async () => {
    logInMock.mockResolvedValue({ success: false, error: { status: 401, message: 'Invalid credentials' } });

    const { result } = renderHook(() => useForm());
    fillLogin(result);

    await act(async () => {
      await result.current.LoginHandler(fakeSubmitEvent);
    });

    expect(result.current.loginNeedsEmailConfirmation).toBe(false);
    expect(result.current.errors).toEqual(['Login failed, try signup instead']);
  });

  it('omits the invite token on login when the user has not consented', async () => {
    // Simulate landing on /login/parent/$parentId (a parent invite link).
    matchRouteMock.mockImplementation(({ to }: { to: string }) =>
      to.includes('login') ? { parentId: 'parent-invite-1' } : false,
    );
    logInMock.mockResolvedValue({ success: false, error: { status: 401, message: 'Invalid credentials' } });

    const { result } = renderHook(() => useForm());
    fillLogin(result);
    // We really are on an invite route — so omitting the token below is a deliberate gate, not a no-op.
    expect(result.current.parentId).toBe('parent-invite-1');

    await act(async () => {
      await result.current.LoginHandler(fakeSubmitEvent);
    });

    expect(logInMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret1',
      inviteToken: undefined,
      acceptInvite: undefined,
    });
  });

  it('redeems the invite token on login only after explicit consent', async () => {
    matchRouteMock.mockImplementation(({ to }: { to: string }) =>
      to.includes('login') ? { parentId: 'parent-invite-1' } : false,
    );
    logInMock.mockResolvedValue({ success: false, error: { status: 401, message: 'Invalid credentials' } });

    const { result } = renderHook(() => useForm());
    fillLogin(result);
    act(() => {
      result.current.setLinkConsent(true);
    });

    await act(async () => {
      await result.current.LoginHandler(fakeSubmitEvent);
    });

    expect(logInMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret1',
      inviteToken: 'parent-invite-1',
      acceptInvite: true,
    });
  });
});
