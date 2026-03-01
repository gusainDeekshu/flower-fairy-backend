import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: 'PAID' | 'SHIPPED' | 'DELIVERED') {
    return this.prisma.order.update({
      where: { id },
      data: { status }, //
    });
  }
}