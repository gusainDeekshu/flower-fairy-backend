// src/products/products.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'; // Use 'import type' here
import { PrismaService } from '../prisma/prisma.service'; // Direct path to service
@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache // Redis Cache
  ) {}

  async getFeatured() {
  const cached = await this.cacheManager.get('featured_products');
  if (cached) return cached;

  const products = await this.prisma.product.findMany({ take: 6 });
  await this.cacheManager.set('featured_products', products, 600);
  return products;
}
}