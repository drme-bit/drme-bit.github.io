import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false && 'b', null, undefined, 0, '')).toBe('a');
  });

  it('handles object maps', () => {
    expect(cn({ active: true, hidden: false, static: true })).toBe('active static');
  });

  it('handles arrays', () => {
    expect(cn(['a', 'b'], ['c'])).toBe('a b c');
  });

  it('returns empty string for nothing', () => {
    expect(cn()).toBe('');
  });
});
