// src/products/products.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Fetch the entire store configuration + catalog in one fast cached hit
  async getStoreCatalog(storeSlug: string) {
    const cacheKey = `store:${storeSlug}:catalog`; 
    
    // 1. Try to serve from Redis first (handles the 100k users/day traffic)
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    // 2. Fallback to DB
    const store = await this.prisma.store.findUnique({
      where: { slug: storeSlug },
      select: {
        id: true,
        name: true,
        themeConfig: true, // Frontend will use this for dynamic CSS (logos, colors)
        products: {
          where: { isActive: true },
          include: {
            category: true,
            variants: true,
          },
        },
      },
    });

    if (!store) throw new NotFoundException('Store not found');

    // 3. Cache the result for 1 hour
    await this.cacheManager.set(cacheKey, store, 3600); 
    
    return store;
  }
}