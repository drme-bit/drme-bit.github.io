import { describe, it, expect } from 'vitest';
import findAnswer from './pageKnowledge';

describe('findAnswer', () => {
  it('returns null for empty input', () => {
    expect(findAnswer('')).toBeNull();
    expect(findAnswer('  ')).toBeNull();
  });

  it('answers site-intent questions', () => {
    expect(findAnswer('what is this site?')).toContain("Vyacheslav Tkachik's personal site");
    expect(findAnswer('tell me about the skills globe')).toContain('3D skills globe');
    expect(findAnswer('how do I contact you?')).toContain('vacheslavtkachik@gmail.com');
  });

  it('answers identity questions', () => {
    const a = findAnswer('what is your name?');
    expect(a).toContain('drme-bit');
  });

  it('returns null for unknown input', () => {
    expect(findAnswer('asdfghjkl zxcvbnm')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(findAnswer('WHAT IS THIS SITE?')).toContain("Vyacheslav Tkachik's personal site");
  });
});
