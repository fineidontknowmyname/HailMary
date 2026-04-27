import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = UPSTASH_URL && UPSTASH_TOKEN 
  ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN })
  : null;

export const cacheService = {
  get: async (key: string): Promise<string | null> => {
    if (!redis) return null;
    try {
      const data = await redis.get<string>(key);
      return data;
    } catch (error) {
      console.error('Redis GET Error:', error);
      return null;
    }
  },

  set: async (key: string, value: string, expirationSeconds: number = 86400): Promise<void> => {
    if (!redis) return;
    try {
      await redis.set(key, value, { ex: expirationSeconds });
    } catch (error) {
      console.error('Redis SET Error:', error);
    }
  }
};