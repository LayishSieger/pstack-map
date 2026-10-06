type Bucket = { tokens: number; updated: number };

const buckets = new Map<string, Bucket>();

/** Fixed window. The first call in a window spends one token. */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.updated >= windowMs) {
    buckets.set(key, { tokens: limit - 1, updated: now });
    return true;
  }
  if (bucket.tokens <= 0) return false;
  bucket.tokens -= 1;
  return true;
}
