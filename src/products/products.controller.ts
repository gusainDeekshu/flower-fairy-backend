import { Controller, Get, Query, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('catalog/:slug')
  async getCatalog(@Param('slug') slug: string) {
    return this.productsService.getStoreCatalog(slug);
  }

  @Get()
  async findAll(@Query('category') category?: string) {
    // 1. Fetch the catalog (cast as 'any' or your Store interface to access properties)
    const catalog = await this.productsService.getStoreCatalog('flower-fairy-dehradun') as any;
    
    // 2. Safely access products from the cached store object
    if (!catalog || !catalog.products) {
      return [];
    }

    if (category) {
      return catalog.products.filter((p: any) => p.category?.slug === category);
    }
    
    return catalog.products;
  }
}