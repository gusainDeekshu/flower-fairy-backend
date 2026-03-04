// src/common/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { AppCacheService } from './cache.service';

@Global() // Makes this module and its exports available app-wide
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get<string>('REDIS_URL'),
          ttl: 600,
        }),
      }),
    }),
  ],
  providers: [AppCacheService],
  exports: [CacheModule, AppCacheService], // Export both the manager and your service
})
export class CommonCacheModule {}