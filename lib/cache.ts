// lib/cache.ts
type CacheItem<T> = {
  data: T;
  timestamp: number;
}

const cache: Record<string, CacheItem<any>> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getFromCache<T>(key: string): T | null {
  const item = cache[key];
  if (!item) return null;
  
  if (Date.now() - item.timestamp > CACHE_TTL) {
    delete cache[key];
    return null;
  }
  
  return item.data;
}

export function setCache<T>(key: string, data: T): void {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
}
