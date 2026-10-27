import { describe, it, expect } from 'vitest';
import { getDiscountPercent } from './utils';

describe('getDiscountPercent', () => {
  it('rounds the percentage off the was price', () => {
    expect(getDiscountPercent('149', '550')).toBe(73);
    expect(getDiscountPercent(80, 100)).toBe(20);
  });

  it('returns null when there is no sale', () => {
    expect(getDiscountPercent('100', null)).toBeNull();
    expect(getDiscountPercent('100', undefined)).toBeNull();
    expect(getDiscountPercent('100', '100')).toBeNull();
    expect(getDiscountPercent('100', '80')).toBeNull();
  });
});
