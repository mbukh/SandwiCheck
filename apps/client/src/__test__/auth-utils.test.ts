import { isSafeReturnTo } from '@/utils/auth-utils';

describe('isSafeReturnTo', () => {
  it('accepts internal non-auth paths', () => {
    expect(isSafeReturnTo('/menu')).toBe(true);
    expect(isSafeReturnTo('/menu?sandwichId=1')).toBe(true);
    expect(isSafeReturnTo('/family')).toBe(true);
  });

  it('rejects auth routes', () => {
    expect(isSafeReturnTo('/login')).toBe(false);
    expect(isSafeReturnTo('/reset-password/abc123')).toBe(false);
  });

  it('rejects absolute and protocol-relative URLs', () => {
    expect(isSafeReturnTo('//evil.com')).toBe(false);
    expect(isSafeReturnTo('https://evil.com')).toBe(false);
    expect(isSafeReturnTo('http://evil.com/path')).toBe(false);
  });

  it('rejects empty/missing values', () => {
    const missing: string | undefined = undefined;
    expect(isSafeReturnTo('')).toBe(false);
    expect(isSafeReturnTo('   ')).toBe(false);
    expect(isSafeReturnTo(null)).toBe(false);
    expect(isSafeReturnTo(missing)).toBe(false);
  });
});
