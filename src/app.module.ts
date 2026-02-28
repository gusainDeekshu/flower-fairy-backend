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

// Health Components
import { HealthController } from './health/health.controller';
import { PrismaHealthIndicator } from './prisma/prisma.health';

@Module({
  imports: [
    // 1. Configuration (Loaded first to ensure variables are available for other modules)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Health Check Monitoring
    TerminusModule,

    // 3. Security: Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // Limit each IP to 100 requests per minute
    }]),

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
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class AppModule {}