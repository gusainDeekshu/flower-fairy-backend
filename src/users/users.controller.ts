// src/users/users.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('check-admin')
  async checkAdmin(@Query('email') email: string) {
    const isAdmin = await this.usersService.isAdmin(email);
    return { isAdmin };
  }
}