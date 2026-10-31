import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkChatQuota,
  resetChatQuotaForTests,
  CHAT_QUOTA_LIMIT,
  CHAT_QUOTA_WINDOW_MS,
} from './quota';

describe('chat quota', () => {
  beforeEach(() => resetChatQuotaForTests());

  it(`allows ${CHAT_QUOTA_LIMIT} questions, then blocks`, () => {
    for (let i = 0; i < CHAT_QUOTA_LIMIT; i++) {
      const r = checkChatQuota('1.2.3.4');
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(CHAT_QUOTA_LIMIT - i - 1);
    }
    const blocked = checkChatQuota('1.2.3.4');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets after the window passes', () => {
    const now = Date.now();
    for (let i = 0; i < CHAT_QUOTA_LIMIT; i++) checkChatQuota('5.6.7.8', now);
    expect(checkChatQuota('5.6.7.8', now).allowed).toBe(false);
    const after = checkChatQuota('5.6.7.8', now + CHAT_QUOTA_WINDOW_MS + 1);
    expect(after.allowed).toBe(true);
    expect(after.remaining).toBe(CHAT_QUOTA_LIMIT - 1);
  });

  it('tracks visitors independently', () => {
    for (let i = 0; i < CHAT_QUOTA_LIMIT; i++) checkChatQuota('10.0.0.1');
    expect(checkChatQuota('10.0.0.1').allowed).toBe(false);
    expect(checkChatQuota('10.0.0.2').allowed).toBe(true);
  });
});
