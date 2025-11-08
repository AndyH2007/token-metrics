import { getCache } from "./cache";
import { assertWithinLimits } from "./ratelimit";

const cache = getCache();

const BASE = process.env.API_BASE_URL || "https://api.tokenmetrics.com/v2";
const API_KEY = process.env.API_KEY || "";
const TTL = Number(process.env.CACHE_TTL_SECONDS || 90);

async function cachedFetch<T>(cacheKey: string, path: string): Promise<T> {
  const cached = await cache.get<T>(cacheKey);
  if (cached) return cached;

  await assertWithinLimits();

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      accept: "application/json",
      "x-api-key": API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstream ${res.status}: ${text}`);
  }

  const data = (await res.json()) as T;
  await cache.set(cacheKey, data, TTL);
  return data;
}

export const api = {
  listTokens: (page = 1, limit = 100) =>
    cachedFetch<any>(
      `tokens:${page}:${limit}`,
      `/tokens?page=${page}&limit=${limit}`
    ),

  getTokenById: (tokenId: string) =>
    cachedFetch<any>(
      `token:${tokenId}`,
      `/tokens?token_id=${tokenId}&limit=1&page=1`
    ),
};
