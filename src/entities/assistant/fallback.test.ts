import { afterEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_DEFAULTS, pickFallbackResponse } from './fallback';

describe('assistant fallback responses', () => {
  afterEach(() => vi.restoreAllMocks());

  it('introduces the assistant without claiming to be the owner', () => {
    const reply = pickFallbackResponse('hello there');
    expect(reply).toContain('portfolio assistant');
    expect(reply).toContain('Vyacheslav');
    expect(reply).not.toContain('I am Dr.ME');
  });

  it('picks a keyword-matched answer from the page knowledge', () => {
    expect(pickFallbackResponse('Tell me about Nexagon')).toContain('Nexagon');
    expect(pickFallbackResponse('How can I get in touch?')).toContain('vacheslavtkachik@gmail.com');
  });

  it('falls back to a default for unknown input', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickFallbackResponse('xkcd 927')).toBe(FALLBACK_DEFAULTS[0]);
  });

  it('every default is a non-empty sentence', () => {
    for (const entry of FALLBACK_DEFAULTS) {
      expect(entry.length).toBeGreaterThan(20);
    }
  });
});
