// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class PrismaService extends PrismaClient
 implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // $connect is a built-in method of PrismaClient
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}