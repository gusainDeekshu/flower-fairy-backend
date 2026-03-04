import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../prisma/prisma.health'; // Changed to relative path for Vercel stability
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    console.log(`Checking health status...`);

    return this.health.check([
      // 1. Database Check
      () => this.prismaIndicator.isHealthy('database'),
      
      // 2. Active Cache Check (Cloud Redis or Memory Fallback)
      // This verifies the actual store configured in your AppModule
      async () => {
        try {
          // Perform a simple read/write to verify the cloud connection
          const testKey = 'health-check-ping';
          await this.cacheManager.set(testKey, 'pong', 10);
          const result = await this.cacheManager.get(testKey);
          
          if (result === 'pong') {
            return { redis: { status: 'up' } };
          }
          throw new Error('Redis response mismatch');
        } catch (e) {
          // If Redis is down, this reports the error in JSON but doesn't crash the server
          return { redis: { status: 'down', message: e.message } };
        }
      },
    ]);
  }
}