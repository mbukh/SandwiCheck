import { createFetchApi } from '@/utils/fetch-api';

const jsonResponse = {
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: { get: () => 'application/json' },
  json: async () => ({ success: true, data: [] }),
};

describe('fetch-api query parameter serialization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('joins array params into a single comma-separated key (hpp collapses repeated keys)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse);
    vi.stubGlobal('fetch', fetchMock);

    const api = createFetchApi('http://api.test');
    await api.get('/sandwiches', { params: { dietaryPreferences: ['kosher', 'vegan'], page: 1 } });

    const url = String(fetchMock.mock.calls[0]?.[0]);
    // "," is URL-encoded as %2C; Express decodes it back before normalizeListParam
    expect(url).toContain('dietaryPreferences=kosher%2Cvegan');
    // The repeated-key form would be truncated to its last value by hpp()
    expect(url.match(/dietaryPreferences=/g)).toHaveLength(1);
    expect(url).toContain('page=1');
  });

  it('omits empty array params entirely', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse);
    vi.stubGlobal('fetch', fetchMock);

    const api = createFetchApi('http://api.test');
    await api.get('/sandwiches', { params: { dietaryPreferences: [], page: 2 } });

    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).not.toContain('dietaryPreferences');
    expect(url).toContain('page=2');
  });
});
