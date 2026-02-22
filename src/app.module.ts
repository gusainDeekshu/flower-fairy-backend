// src/app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module'; // Ensure you created this in the previous step
import { ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    // Register the Prisma and Products modules
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // Limit each IP to 100 requests per minute
    }]),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    }),
    PrismaModule,
    ProductsModule,
    // Configuration for global caching
    CacheModule.register({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}