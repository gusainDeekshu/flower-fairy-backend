// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller'; 

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Exporting allows other modules to use this service
})
export class ProductsModule {}