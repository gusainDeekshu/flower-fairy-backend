// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { redisStore } from 'cache-manager-redis-yet';
import { CommonCacheModule } from './common/cache/cache.module'; // Import your new module
// Internal Modules
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';

// Health Components
import { HealthController } from './health/health.controller';
import { PrismaHealthIndicator } from './prisma/prisma.health';
import { AdminStoreController } from './admin/store.controller';
import { AdminProductsController } from './admin/products.controller';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    // 1. Configuration (Loaded first to ensure variables are available for other modules)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Health Check Monitoring
    TerminusModule,

    // 3. Security: Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // Limit each IP to 100 requests per minute
      },
    ]),

    // 4. Redis Caching Configuration
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST') || 'localhost',
            port: configService.get<number>('REDIS_PORT') || 6379,
          },
          ttl: 600, // Production default TTL: 10 minutes
        }),
      }),
    }),
    CommonCacheModule,
    // 5. Business Logic Modules
    PrismaModule,
    ProductsModule,
    PaymentsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [
    HealthController,
    AdminProductsController, // Add these
    AdminStoreController,
    UsersController
  ],
  providers: [PrismaHealthIndicator,UsersService],
})
export class AppModule {}
