import { describe, it, expect, vi, afterEach } from 'vitest';
import { getMockMessage, pickResponse, MOCK_VARIANTS, DEFAULTS, RESPONSES } from './responses';

describe('mascot responses', () => {
  afterEach(() => vi.restoreAllMocks());

  it('clamps the mock message count', () => {
    expect(getMockMessage(0)).toBe(MOCK_VARIANTS[0]);
    expect(getMockMessage(999)).toBe(MOCK_VARIANTS[MOCK_VARIANTS.length - 1]);
  });

  it('picks a keyword-matched response', () => {
    expect(pickResponse('hello there')).toBe(RESPONSES[1].response);
    expect(pickResponse('how are you doing')).toBe(RESPONSES[0].response);
    expect(pickResponse('tell me a joke')).toBe(RESPONSES[5].response);
  });

  it('falls back to a default for unknown input', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(DEFAULTS).toContain(pickResponse('xkcd 927'));
  });

  it('every response entry has non-empty keywords and a response', () => {
    for (const entry of RESPONSES) {
      expect(entry.keywords.length).toBeGreaterThan(0);
      expect(entry.response.length).toBeGreaterThan(0);
    }
  });
});
