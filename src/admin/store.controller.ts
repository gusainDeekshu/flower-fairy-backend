import { Controller, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/store')
export class AdminStoreController {
  constructor(private prisma: PrismaService) {}

  @Put('config/:slug')
  async updateThemeConfig(@Param('slug') slug: string, @Body() config: any) {
    // Example config structure: { banners: [{ title: 'Valentine', activeUntil: '2026-02-15' }] }
    return this.prisma.store.update({
      where: { slug },
      data: { themeConfig: config },
    });
  }
}