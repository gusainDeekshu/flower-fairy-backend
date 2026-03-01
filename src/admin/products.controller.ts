import { Controller, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('admin/products')
@UseGuards(AdminGuard)
export class AdminProductsController {
  constructor(private prisma: PrismaService) {}

  // Update product price and details
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        isActive: data.isActive,
        description: data.description,
      },
    });
  }

  // Update specific variants (e.g., XL Bouquet price)
  @Put('variants/:id')
  async updateVariant(@Param('id') id: string, @Body() data: { priceModifier: number, stock: number }) {
    return this.prisma.productVariant.update({
      where: { id },
      data: {
        priceModifier: data.priceModifier,
        stock: data.stock,
      },
    });
  }
}