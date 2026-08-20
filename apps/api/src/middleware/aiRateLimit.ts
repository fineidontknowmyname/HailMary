import type { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import type { AuthenticatedRequest } from '../types/express';

const WINDOW_SECONDS = 60 * 60;
const MAX_REQUESTS = 30;

const memoryCounts = new Map<string, { count: number; resetAt: number }>();

function checkLimitInMemory(userId: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = memoryCounts.get(userId);

  if (!entry || entry.resetAt <= now) {
    memoryCounts.set(userId, { count: 1, resetAt: now + WINDOW_SECONDS * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

async function checkLimit(userId: string): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  if (!redis) return checkLimitInMemory(userId);

  const key = `ai-rate:${userId}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }
    if (count > MAX_REQUESTS) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  } catch (error) {
    console.error('AI rate limit Redis error:', error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

export async function aiRateLimit(req: Request, res: Response, next: NextFunction) {
  const userId = (req as AuthenticatedRequest).user?.id;
  if (!userId) return next();

  const { allowed, retryAfterSeconds } = await checkLimit(userId);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      error: `AI request limit reached. Please try again in ${Math.max(1, Math.ceil(retryAfterSeconds / 60))} minute(s).`,
    });
  }

  next();
}
