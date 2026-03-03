// flower-fairy-backend/src/admin/products.controller.ts
import { Controller, Put, Post, Body, Param, UseGuards, BadRequestException, Logger, Req } from '@nestjs/common'; // Added Post
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/products')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminProductsController {
  constructor(private prisma: PrismaService) {}

  // ADD THIS METHOD TO HANDLE SAVING NEW PRODUCTS
 @Post()
 async createProduct(@Body() data: any, @Req() req: any) {
  const logger = new Logger('AdminProducts');
  
  // DEBUG 1: Verify the user object attached by Passport
  logger.log('--- Auth Debug ---');
  logger.log(`User in Request: ${JSON.stringify(req.user)}`);

  // DEBUG 2: Verify the incoming data from frontend
  logger.log('--- Data Debug ---');
  logger.log(`Payload: ${JSON.stringify(data)}`);

  try {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const result = await this.prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: parseFloat(data.price),
        image: data.image,
        isActive: true,
        store: { connect: { id: data.storeId } },
        category: { connect: { id: data.categoryId } },
        variants: {
          create: {
            name: 'Standard',
            stock: parseInt(data.initialStock) || 0,
            priceModifier: 0
          }
        }
      },
    });

    logger.log('Product created successfully');
    return result;

  } catch (error) {
    logger.error(`Prisma Error: ${error.message}`);
       if (error.code === 'P2025') {
    throw new BadRequestException('The provided Store ID or Category ID does not exist.');
  }
  
  if (error.code === 'P2002') {
    throw new BadRequestException('Product slug already exists');
  }
  
  throw error;

  }
}

  // Update specific variants (e.g., XL Bouquet price)
  @Put('variants/:id')
  async updateVariant(
    @Param('id') id: string,
    @Body() data: { priceModifier: number; stock: number },
  ) {
    return this.prisma.productVariant.update({
      where: { id },
      data: {
        priceModifier: data.priceModifier,
        stock: data.stock,
      },
    });
  }
}
