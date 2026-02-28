import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';
import { PrismaHealthIndicator } from 'src/prisma/prisma.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    console.log(`Checking health status`);

    return this.health.check([
      // Database Check
      () => this.prismaIndicator.isHealthy('database'),
      
      // Redis Check via Microservice indicator (Production-grade TCP check)
      () => this.microservice.pingCheck('redis', {
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      }),
    ]);
  }
}