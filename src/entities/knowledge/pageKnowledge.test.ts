import { describe, expect, it } from 'vitest';
import findAnswer from './pageKnowledge';

describe('findAnswer', () => {
  it('returns null for empty input', () => {
    expect(findAnswer('')).toBeNull();
    expect(findAnswer('  ')).toBeNull();
  });

  it('answers site-intent questions', () => {
    expect(findAnswer('what is this site?')).toContain("Vyacheslav Tkachyk's personal portfolio");
    expect(findAnswer('tell me about the skills globe')).toContain('starfield');
    expect(findAnswer('how do I contact you?')).toContain('vacheslavtkachik@gmail.com');
  });

  it('answers identity questions without impersonating the owner', () => {
    const answer = findAnswer('what is your name?');
    expect(answer).toContain("I'm the Assistant");
    expect(answer).toContain('not Vyacheslav');
  });

  it('answers owner questions with the real identity', () => {
    expect(findAnswer('who is drme-bit?')).toContain('Vyacheslav Tkachyk');
  });

  it('answers assistant-usage questions', () => {
    expect(findAnswer('how do I open the assistant?')).toContain('30 questions');
  });

  it('returns null for unknown input', () => {
    expect(findAnswer('asdfghjkl zxcvbnm')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(findAnswer('WHAT IS THIS SITE?')).toContain("Vyacheslav Tkachyk's personal portfolio");
  });
});
