import { describe, expect, it } from 'vitest';
import { normalizeContactFormUrl } from '../src/lib/contact';

describe('normalizeContactFormUrl', () => {
  it('accepts public http and https URLs', () => {
    expect(normalizeContactFormUrl('https://docs.google.com/forms/d/e/example/viewform'))
      .toBe('https://docs.google.com/forms/d/e/example/viewform');
    expect(normalizeContactFormUrl(' http://localhost:3000/contact '))
      .toBe('http://localhost:3000/contact');
  });

  it('returns null for missing, invalid, or unsafe URLs', () => {
    expect(normalizeContactFormUrl(undefined)).toBeNull();
    expect(normalizeContactFormUrl('')).toBeNull();
    expect(normalizeContactFormUrl('not-a-url')).toBeNull();
    expect(normalizeContactFormUrl('javascript:alert(1)')).toBeNull();
  });
});
