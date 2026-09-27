/*  Per-visitor question quota for /api/chat: LIMIT questions per rolling
    WINDOW, keyed by client IP. In-memory and process-local (resets on cold
    start / differs across instances), so this is best-effort protection.
    Pure logic lives here so it stays unit-testable.  */

export const CHAT_QUOTA_LIMIT = 10;
export const CHAT_QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000;

interface Bucket {
  used: number;
  reset: number;
}

const buckets = new Map<string, Bucket>();

export function getClientIp(req: Request): string {
  return req.headers.get('x-real-ip')?.trim() || 'anon';
}

export interface QuotaCheck {
  allowed: boolean;
  remaining: number;
  reset: number;
}

export function checkChatQuota(ip: string, now: number = Date.now()): QuotaCheck {
  let bucket = buckets.get(ip);
  if (!bucket || now >= bucket.reset) {
    bucket = { used: 0, reset: now + CHAT_QUOTA_WINDOW_MS };
    buckets.set(ip, bucket);
  }
  if (bucket.used >= CHAT_QUOTA_LIMIT) {
    return { allowed: false, remaining: 0, reset: bucket.reset };
  }
  bucket.used += 1;

  if (buckets.size > 5000) {
    for (const [key, b] of buckets) {
      if (now >= b.reset) buckets.delete(key);
    }
  }

  return { allowed: true, remaining: CHAT_QUOTA_LIMIT - bucket.used, reset: bucket.reset };
}

/** Test-only escape hatch. */
export function resetChatQuotaForTests(): void {
  buckets.clear();
}
