import { act, renderHook } from '@testing-library/react';
import useForm from '@/hooks/use-form';

const signUpMock = vi.fn();
const matchRouteMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useMatchRoute: () => matchRouteMock,
  useNavigate: () => vi.fn(),
}));

vi.mock('@/context/AuthGlobalContext', () => ({
  useAuthGlobalContext: () => ({ logIn: vi.fn(), signUp: signUpMock, currentUser: {} }),
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
    signUpMock.mockResolvedValue({ success: true, message: 'Please check your email to confirm your account' });
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
});
