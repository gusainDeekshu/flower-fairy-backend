// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonCacheModule } from '../common/cache/cache.module'; // Import this

@Module({
  imports: [
    PrismaModule, 
    CommonCacheModule // <--- Ensures AppCacheService is available here
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}