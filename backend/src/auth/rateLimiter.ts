// In-memory Login Rate Limiting & Brute-Force Protection
// Tracks failed login attempts per IP / identifier with sliding window lockout

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes attempt window

const attemptStore = new Map<string, AttemptRecord>();

// Periodic cleanup of stale records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptStore.entries()) {
    if (now > record.lockedUntil && now - record.firstAttempt > WINDOW_DURATION_MS) {
      attemptStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown-ip';
}

export function checkLoginRateLimit(key: string): { isLimited: boolean; remainingLockoutSeconds?: number } {
  const record = attemptStore.get(key);
  if (!record) {
    return { isLimited: false };
  }

  const now = Date.now();
  if (now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLimited: true, remainingLockoutSeconds: remainingSeconds };
  }

  // If lockout or window has passed, reset
  if (now - record.firstAttempt > WINDOW_DURATION_MS) {
    attemptStore.delete(key);
    return { isLimited: false };
  }

  return { isLimited: false };
}

export function recordFailedLogin(key: string): { isLocked: boolean; remainingLockoutSeconds?: number } {
  const now = Date.now();
  let record = attemptStore.get(key);

  if (!record || now - record.firstAttempt > WINDOW_DURATION_MS) {
    record = {
      count: 1,
      firstAttempt: now,
      lockedUntil: 0,
    };
    attemptStore.set(key, record);
    return { isLocked: false };
  }

  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    const remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    return { isLocked: true, remainingLockoutSeconds: remainingSeconds };
  }

  return { isLocked: false };
}

export function recordSuccessfulLogin(key: string): void {
  attemptStore.delete(key);
}
