import { readJsonFromStorage } from '@/utils/storage-utils';

describe('readJsonFromStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('parses and returns a valid JSON value', () => {
    localStorage.setItem('user', JSON.stringify({ id: 7, name: 'BLT' }));

    expect(readJsonFromStorage<{ id: number; name: string }>('user')).toEqual({ id: 7, name: 'BLT' });
  });

  it('returns null for a missing key', () => {
    expect(readJsonFromStorage('absent')).toBeNull();
  });

  it('returns null and clears the key for a corrupt value', () => {
    localStorage.setItem('broken', '{ not valid json');

    expect(readJsonFromStorage('broken')).toBeNull();
    // The corrupt value is removed so it can't wedge every subsequent read.
    expect(localStorage.getItem('broken')).toBeNull();
  });
});
