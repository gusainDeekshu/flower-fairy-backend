// src/products/products.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache // Redis Cache
  ) {}

  async getFeaturedProducts() {
    const cacheKey = 'featured_products';
    
    // Check Redis first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Fetch from Postgres if cache miss
    const products = await this.prisma.product.findMany({
      where: { rating: { gte: 4.5 } },
      take: 10
    });

    // Save to Redis for 1 hour
    await this.cacheManager.set(cacheKey, products, 3600);
    return products;
  }
}