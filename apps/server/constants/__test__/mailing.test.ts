import { describe, expect, it } from 'vitest';
import { generateChildActivationHtml, generateEmailConfirmationHtml, generateHtmlMessage } from '../mailing.ts';

const XSS = '<img src=x onerror=alert(1)>';

describe('email template HTML escaping', () => {
  it('escapes user.name in the password-reset email', () => {
    const html = generateHtmlMessage({ user: { name: XSS }, resetURL: 'https://app/reset/abc' });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes user.name in the confirmation email', () => {
    const html = generateEmailConfirmationHtml({ user: { name: XSS }, confirmationURL: 'https://app/c/abc' });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });

  it('escapes childName and parentName in the child-activation email', () => {
    const html = generateChildActivationHtml({
      childName: XSS,
      parentName: '<b>evil</b>',
      confirmationURL: 'https://app/c/abc',
      resetURL: 'https://app/reset/abc',
    });
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<b>evil</b>');
    expect(html).toContain('&lt;img');
    expect(html).toContain('&lt;b&gt;evil&lt;/b&gt;');
  });

  it('leaves the legitimate URL untouched', () => {
    const url = 'https://app/reset/abc-123';
    const html = generateHtmlMessage({ user: { name: 'Alice' }, resetURL: url });
    expect(html).toContain(`href="${url}"`);
  });
});
