// src/common/cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl: number = 3600): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached) return cached;

    const result = await fn();
    await this.cacheManager.set(key, result, ttl);
    return result;
  }
}