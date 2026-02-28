// src/products/products.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { AppCacheService } from 'src/common/cache/cache.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Fetch the entire store configuration + catalog in one fast cached hit
  async getStoreCatalog(slug: string) {
    const cacheKey = `catalog:${slug}`;
    
    // Uses your custom getOrSet logic
    return this.cache.getOrSet(cacheKey, async () => {
      const store = await this.prisma.store.findUnique({
        where: { slug },
        include: {
          products: {
            where: { isActive: true },
            include: { category: true, variants: true },
          },
        },
      });

      if (!store) throw new NotFoundException(`Store ${slug} not found`);
      return store;
    }, 3600);
  }
}