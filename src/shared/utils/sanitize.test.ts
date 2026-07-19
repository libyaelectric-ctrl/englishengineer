import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizePlainText, sanitizeUrl } from './sanitize';

describe('sanitizeHtml', () => {
  it('allows safe tags', () => {
    expect(sanitizeHtml('<b>bold</b>')).toBe('<b>bold</b>');
    expect(sanitizeHtml('<p>paragraph</p>')).toBe('<p>paragraph</p>');
  });

  it('removes script tags', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('');
  });

  it('removes disallowed tags', () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('');
  });
});

describe('sanitizePlainText', () => {
  it('removes all HTML', () => {
    expect(sanitizePlainText('<b>hello</b>')).toBe('hello');
  });

  it('handles plain text', () => {
    expect(sanitizePlainText('hello world')).toBe('hello world');
  });
});

describe('sanitizeUrl', () => {
  it('allows http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('allows relative paths', () => {
    expect(sanitizeUrl('/dashboard')).toBe('/dashboard');
  });

  it('blocks javascript URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
  });
});
