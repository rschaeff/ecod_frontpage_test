// lib/cache.ts - Simple in-memory cache utility

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (optional)
   */
  set<T = any>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete value from cache
   * @param key Cache key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton cache instance
const memoryCache = new MemoryCache();

// Clean up expired entries every 10 minutes
setInterval(() => {
  memoryCache.cleanup();
}, 10 * 60 * 1000);

/**
 * Get value from cache
 * @param key Cache key
 * @returns Cached value or null
 */
export function getFromCache<T = any>(key: string): T | null {
  return memoryCache.get<T>(key);
}

/**
 * Set value in cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in milliseconds (optional)
 */
export function setCache<T = any>(key: string, value: T, ttl?: number): void {
  memoryCache.set(key, value, ttl);
}

/**
 * Delete value from cache
 * @param key Cache key
 * @returns True if deleted, false if not found
 */
export function deleteFromCache(key: string): boolean {
  return memoryCache.delete(key);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Get cache statistics
 * @returns Cache size and other stats
 */
export function getCacheStats() {
  return {
    size: memoryCache.size(),
    // Add more stats as needed
  };
}
