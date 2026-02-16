// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
// Remove the controller import if you haven't created products.controller.ts yet
// import { ProductsController } from './products.controller'; 

@Module({
  // controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Exporting allows other modules to use this service
})
export class ProductsModule {}