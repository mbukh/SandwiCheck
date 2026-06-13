import { act, renderHook } from '@testing-library/react';
import useGallery from '@/hooks/use-gallery';
import * as apiSandwiches from '@/services/api-sandwiches';
import type { ApiResult } from '@/types/api';
import type { Sandwich } from '@/types/domain';

vi.mock('@/services/api-sandwiches', () => ({ fetchSandwiches: vi.fn() }));
vi.mock('@/services/api-users', () => ({ fetchUserById: vi.fn() }));

const fetchSandwichesMock = vi.mocked(apiSandwiches.fetchSandwiches);

const failure: ApiResult<Sandwich[]> = { success: false, error: { message: 'Server is down' } };
const success: ApiResult<Sandwich[]> = { success: true, data: [{ id: '1' } as unknown as Sandwich] };

describe('useGallery error state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets galleryError when the sandwich fetch fails', async () => {
    fetchSandwichesMock.mockResolvedValue(failure);
    const { result } = renderHook(() => useGallery());

    await act(async () => {
      await result.current.fetchSandwiches({});
    });

    expect(result.current.galleryError).toBe('Server is down');
    expect(result.current.gallerySandwiches).toEqual([]);
  });

  it('clears galleryError on a subsequent successful fetch', async () => {
    fetchSandwichesMock.mockResolvedValueOnce(failure).mockResolvedValueOnce(success);
    const { result } = renderHook(() => useGallery());

    await act(async () => {
      await result.current.fetchSandwiches({});
    });
    expect(result.current.galleryError).toBe('Server is down');

    await act(async () => {
      await result.current.fetchSandwiches({});
    });
    expect(result.current.galleryError).toBeNull();
    expect(result.current.gallerySandwiches).toHaveLength(1);
  });
});

describe('useGallery stale-response guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('drops a slow earlier response so it cannot clobber a newer one', async () => {
    // Two requests in flight at once; the OLDER one will resolve last and must be ignored.
    let resolveFirst!: (value: ApiResult<Sandwich[]>) => void;
    let resolveSecond!: (value: ApiResult<Sandwich[]>) => void;
    const firstInFlight = new Promise<ApiResult<Sandwich[]>>((resolve) => {
      resolveFirst = resolve;
    });
    const secondInFlight = new Promise<ApiResult<Sandwich[]>>((resolve) => {
      resolveSecond = resolve;
    });
    fetchSandwichesMock.mockReturnValueOnce(firstInFlight).mockReturnValueOnce(secondInFlight);

    const { result } = renderHook(() => useGallery());

    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.fetchSandwiches({});
      second = result.current.fetchSandwiches({});
    });

    // The newer (second) request resolves first and commits its data.
    await act(async () => {
      resolveSecond({ success: true, data: [{ id: 'newest' } as unknown as Sandwich] });
      await second;
    });
    expect(result.current.gallerySandwiches).toEqual([{ id: 'newest' }]);

    // The older (first) request resolves last — its stale data must be dropped, not committed.
    await act(async () => {
      resolveFirst({ success: true, data: [{ id: 'stale' } as unknown as Sandwich] });
      await first;
    });
    expect(result.current.gallerySandwiches).toEqual([{ id: 'newest' }]);
  });
});
