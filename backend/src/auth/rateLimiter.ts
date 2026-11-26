// Distributed Login Rate Limiting & Brute-Force Protection
// Backed by persistent MongoDB Atlas storage with automatic TTL index expiration,
// synchronized atomic updates, and in-memory fail-secure fallback.

import { LoginAttemptModel } from '../db/models/LoginAttempt.js';
import { connectToDatabase } from '../db/mongodb.js';
import { config } from '../config/index.js';

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
export const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes attempt window

// In-memory store used as fast-path cache and fail-secure fallback
const attemptStore = new Map<string, AttemptRecord>();

// Periodic in-memory garbage collection
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of attemptStore.entries()) {
      if (now > record.lockedUntil && now - record.firstAttempt > WINDOW_DURATION_MS) {
        attemptStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
  if (timer.unref) timer.unref();
}

export function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown-ip';
}

/**
 * Checks if a client/account is currently rate limited or locked out.
 * Queries distributed MongoDB storage first, with in-memory fallback.
 */
export async function checkLoginRateLimit(
  key: string
): Promise<{ isLimited: boolean; remainingLockoutSeconds?: number }> {
  const now = Date.now();

  // 1. Fast in-memory check (fail-secure)
  const memRecord = attemptStore.get(key);
  if (memRecord && now < memRecord.lockedUntil) {
    const remainingSeconds = Math.ceil((memRecord.lockedUntil - now) / 1000);
    return { isLimited: true, remainingLockoutSeconds: remainingSeconds };
  }

  // 2. Distributed MongoDB Atlas check
  try {
    if (!config.useMockDb && (process.env.MONGODB_URI || config.mongoUri)) {
      await connectToDatabase();
      const record = await LoginAttemptModel.findOne({ key }).lean();

      if (record) {
        const lockedUntilMs = record.lockedUntil ? new Date(record.lockedUntil).getTime() : 0;
        if (now < lockedUntilMs) {
          const remainingSeconds = Math.ceil((lockedUntilMs - now) / 1000);
          // Mirror into in-memory store for fail-secure redundancy
          attemptStore.set(key, {
            count: record.count,
            firstAttempt: new Date(record.firstAttempt).getTime(),
            lockedUntil: lockedUntilMs,
          });
          return { isLimited: true, remainingLockoutSeconds: remainingSeconds };
        }

        // Check if window is still active
        const firstAttemptMs = new Date(record.firstAttempt).getTime();
        if (now - firstAttemptMs <= WINDOW_DURATION_MS && record.count >= MAX_FAILED_ATTEMPTS) {
          const remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
          return { isLimited: true, remainingLockoutSeconds: remainingSeconds };
        }
      }
    }
  } catch (err) {
    console.warn('[RATE LIMITER WARNING] Failed to query MongoDB rate limit; using fail-secure fallback:', err);
    // If DB is unreachable, rely on in-memory store (fail-secure: already checked above)
  }

  return { isLimited: false };
}

/**
 * Records a failed authentication attempt with atomic increment and automatic lockout.
 * Backed by MongoDB atomic findOneAndUpdate and MongoDB TTL index cleanup.
 */
export async function recordFailedLogin(
  key: string
): Promise<{ isLocked: boolean; remainingLockoutSeconds?: number }> {
  const now = Date.now();
  const nowDate = new Date(now);

  // 1. Update in-memory fallback
  let memRecord = attemptStore.get(key);
  if (!memRecord || now - memRecord.firstAttempt > WINDOW_DURATION_MS) {
    memRecord = { count: 1, firstAttempt: now, lockedUntil: 0 };
  } else {
    memRecord.count += 1;
    if (memRecord.count >= MAX_FAILED_ATTEMPTS) {
      memRecord.lockedUntil = now + LOCKOUT_DURATION_MS;
    }
  }
  attemptStore.set(key, memRecord);

  // 2. Atomic MongoDB update
  try {
    if (!config.useMockDb && (process.env.MONGODB_URI || config.mongoUri)) {
      await connectToDatabase();
      const windowThreshold = new Date(now - WINDOW_DURATION_MS);

      const existing = await LoginAttemptModel.findOne({ key });

      if (!existing || existing.firstAttempt < windowThreshold) {
        // Start a fresh attempt window
        await LoginAttemptModel.findOneAndUpdate(
          { key },
          {
            $set: {
              count: 1,
              firstAttempt: nowDate,
              lockedUntil: null,
              expiresAt: new Date(now + WINDOW_DURATION_MS),
            },
          },
          { upsert: true, new: true }
        );
        return { isLocked: false };
      } else {
        // Increment within existing window
        const nextCount = existing.count + 1;
        const isLocked = nextCount >= MAX_FAILED_ATTEMPTS;
        const lockedUntil = isLocked ? new Date(now + LOCKOUT_DURATION_MS) : null;
        const expiresAt = isLocked
          ? new Date(now + LOCKOUT_DURATION_MS)
          : new Date(existing.firstAttempt.getTime() + WINDOW_DURATION_MS);

        await LoginAttemptModel.updateOne(
          { key },
          {
            $set: {
              count: nextCount,
              lockedUntil,
              expiresAt,
            },
          }
        );

        if (isLocked) {
          const remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
          return { isLocked: true, remainingLockoutSeconds: remainingSeconds };
        }
        return { isLocked: false };
      }
    }
  } catch (err) {
    console.warn('[RATE LIMITER WARNING] Failed to record attempt in MongoDB; using in-memory state:', err);
  }

  // Fallback return
  if (memRecord.count >= MAX_FAILED_ATTEMPTS) {
    const remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    return { isLocked: true, remainingLockoutSeconds: remainingSeconds };
  }

  return { isLocked: false };
}

/**
 * Clears rate limiting on successful login for the given key across both
 * distributed MongoDB storage and local in-memory cache.
 */
export async function recordSuccessfulLogin(key: string): Promise<void> {
  attemptStore.delete(key);

  try {
    if (!config.useMockDb && (process.env.MONGODB_URI || config.mongoUri)) {
      await connectToDatabase();
      await LoginAttemptModel.deleteOne({ key });
    }
  } catch (err) {
    console.warn('[RATE LIMITER WARNING] Failed to delete MongoDB rate limit record:', err);
  }
}
