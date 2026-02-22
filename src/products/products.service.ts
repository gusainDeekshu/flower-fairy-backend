import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getStoreCatalog(storeId: string) {
    const cacheKey = `store:${storeId}:products`; // Isolated cache partition
    
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const products = await this.prisma.product.findMany({
      where: { storeId },
      include: { variants: true },
    });

    await this.cacheManager.set(cacheKey, products, 3600); // 1 hour cache
    return products;
  }
}