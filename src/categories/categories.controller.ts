// flower-fairy-backend/src/categories/categories.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('categories') // Becomes /api/v1/categories
export class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAll() {
    console.log('Fetching all categories');
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }
}