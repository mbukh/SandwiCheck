import { DIETARY_PREFERENCE } from '@sandwicheck/shared';
import { removeSandwichFromWeekMenu, updateUserById } from '@/services/api-users';

const jsonResponse = {
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: { get: () => 'application/json' },
  json: async () => ({ success: true, data: [] }),
};

describe('api-users request shapes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends sandwichId in the DELETE body when removing a week-menu sandwich', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse);
    vi.stubGlobal('fetch', fetchMock);

    await removeSandwichFromWeekMenu({ userId: 'u1', day: 'monday', sandwichId: 's1' });

    const url = String(fetchMock.mock.calls[0]?.[0]);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(url).toContain('/users/u1/week-menu/monday');
    expect(init.method).toBe('DELETE');
    expect(JSON.parse(init.body as string)).toEqual({ sandwichId: 's1' });
  });

  it('appends each dietary preference as a repeated field and names the file profilePicture', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse);
    vi.stubGlobal('fetch', fetchMock);

    const imageBuffer = new Blob(['png-bytes'], { type: 'image/png' });
    await updateUserById('u1', {
      dietaryPreferences: [DIETARY_PREFERENCE.kosher, DIETARY_PREFERENCE.vegan],
      file: { imageBuffer },
    });

    const body = (fetchMock.mock.calls[0]?.[1] as RequestInit).body as FormData;
    // Repeated keys, not one "kosher,vegan" string — that is what the server's [String] enum expects.
    expect(body.getAll('dietaryPreferences')).toEqual([DIETARY_PREFERENCE.kosher, DIETARY_PREFERENCE.vegan]);
    expect(body.get('profilePicture')).toBeInstanceOf(File);
    expect(body.get('file')).toBeNull();
  });
});
