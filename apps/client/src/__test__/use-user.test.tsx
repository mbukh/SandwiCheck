import { act, renderHook } from '@testing-library/react';
import useUser from '@/hooks/use-user';

const getSessionMock = vi.fn();

vi.mock('@/services/api-auth', () => ({
  getSession: () => getSessionMock(),
}));

describe('useUser refreshSession failure handling', () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    localStorage.setItem('loggedIn', JSON.stringify(Date.now()));
  });

  it('clears the loggedIn flag when the session check returns 401', async () => {
    getSessionMock.mockResolvedValue({ success: false, error: { status: 401, message: 'Not authenticated' } });

    const { result } = renderHook(() => useUser());
    await act(async () => {
      await result.current.refreshSession();
    });

    expect(localStorage.getItem('loggedIn')).toBeNull();
    expect(result.current.currentUser).toEqual({});
  });

  it('keeps the loggedIn flag on a transient network failure (status 0)', async () => {
    getSessionMock.mockResolvedValue({ success: false, error: { status: 0, message: 'Network error' } });

    const { result } = renderHook(() => useUser());
    await act(async () => {
      await result.current.refreshSession();
    });

    expect(localStorage.getItem('loggedIn')).not.toBeNull();
  });
});
