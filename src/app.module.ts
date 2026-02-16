// src/app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module'; // Ensure you created this in the previous step

@Module({
  imports: [
    // Register the Prisma and Products modules
    PrismaModule,
    ProductsModule,
    // Configuration for global caching
    CacheModule.register({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}