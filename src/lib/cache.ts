import Redis from "ioredis";

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  incr(key: string): Promise<number>;
}

class MemoryCache implements CacheAdapter {
  private store = new Map<string, { value: any; expiresAt: number }>();
  async get<T>(key: string): Promise<T | null> {
    const hit = this.store.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return hit.value as T;
  }
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
  async incr(key: string): Promise<number> {
    const hit = this.store.get(key);
    const cur = hit?.value ?? 0;
    const next = Number(cur) + 1;
    const ttlMs = 35 * 24 * 3600 * 1000; // ~35 days
    this.store.set(key, { value: next, expiresAt: Date.now() + ttlMs });
    return next;
  }
}

class RedisCache implements CacheAdapter {
  private redis: Redis;
  constructor() {
    const url = process.env.UPSTASH_REDIS_URL!;
    const token = process.env.UPSTASH_REDIS_TOKEN!;
    this.redis = new Redis(url, {
      username: "default",
      password: token,
      tls: { rejectUnauthorized: false },
    });
  }
  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }
  async incr(key: string): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1) await this.redis.expire(key, 35 * 24 * 3600);
    return count;
  }
}

export function getCache(): CacheAdapter {
  const adapter = (process.env.CACHE_ADAPTER || "memory").toLowerCase();
  if (adapter === "redis") {
    if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
      throw new Error("Redis adapter selected but UPSTASH env vars are missing.");
    }
    return new RedisCache();
  }
  return new MemoryCache();
}
