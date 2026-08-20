import type { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import type { AuthenticatedRequest } from '../types/express';

function checkLimitInMemory(
  store: Map<string, { count: number; resetAt: number }>,
  userId: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = store.get(userId);

  if (!entry || entry.resetAt <= now) {
    store.set(userId, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

async function checkLimit(
  store: Map<string, { count: number; resetAt: number }>,
  keyPrefix: string,
  userId: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  if (!redis) return checkLimitInMemory(store, userId, maxRequests, windowSeconds);

  const key = `${keyPrefix}:${userId}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    if (count > maxRequests) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : windowSeconds };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  } catch (error) {
    console.error(`Rate limit Redis error (${keyPrefix}):`, error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Builds a per-user rate-limiting middleware. Must run after `requireAuth`.
 * Redis-backed (shared across instances) with an in-memory fallback for
 * local dev / Redis outages — fails open on Redis errors.
 */
export function createUserRateLimit(keyPrefix: string, maxRequests: number, windowSeconds: number) {
  const memoryStore = new Map<string, { count: number; resetAt: number }>();

  return async function userRateLimit(req: Request, res: Response, next: NextFunction) {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return next();

    const { allowed, retryAfterSeconds } = await checkLimit(memoryStore, keyPrefix, userId, maxRequests, windowSeconds);
    if (!allowed) {
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: `Rate limit reached. Please try again in ${Math.max(1, Math.ceil(retryAfterSeconds / 60))} minute(s).`,
      });
    }

    next();
  };
}

export const aiRateLimit = createUserRateLimit('ai-rate', 30, 60 * 60);
