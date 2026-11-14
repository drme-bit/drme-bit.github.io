import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkAssistantQuota,
  resetAssistantQuotaForTests,
  ASSISTANT_QUOTA_LIMIT,
  ASSISTANT_QUOTA_WINDOW_MS,
} from './quota';

describe('assistant quota', () => {
  beforeEach(() => resetAssistantQuotaForTests());

  it(`allows ${ASSISTANT_QUOTA_LIMIT} questions, then blocks`, () => {
    for (let i = 0; i < ASSISTANT_QUOTA_LIMIT; i++) {
      const r = checkAssistantQuota('1.2.3.4');
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(ASSISTANT_QUOTA_LIMIT - i - 1);
    }
    const blocked = checkAssistantQuota('1.2.3.4');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets after the window passes', () => {
    const now = Date.now();
    for (let i = 0; i < ASSISTANT_QUOTA_LIMIT; i++) checkAssistantQuota('5.6.7.8', now);
    expect(checkAssistantQuota('5.6.7.8', now).allowed).toBe(false);
    const after = checkAssistantQuota('5.6.7.8', now + ASSISTANT_QUOTA_WINDOW_MS + 1);
    expect(after.allowed).toBe(true);
    expect(after.remaining).toBe(ASSISTANT_QUOTA_LIMIT - 1);
  });

  it('tracks visitors independently', () => {
    for (let i = 0; i < ASSISTANT_QUOTA_LIMIT; i++) checkAssistantQuota('10.0.0.1');
    expect(checkAssistantQuota('10.0.0.1').allowed).toBe(false);
    expect(checkAssistantQuota('10.0.0.2').allowed).toBe(true);
  });
});
