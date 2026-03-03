// flower-fairy-backend/src/users/users.controller.ts
import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  @Get('check-admin')
  async checkAdmin(@Query('email') email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.role === 'ADMIN') {
      // 1. Generate a token signed with YOUR JWT_SECRET
      const accessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // 2. Return both the status and the new token
      return { 
        isAdmin: true, 
        accessToken,
        user: { id: user.id, email: user.email, role: user.role }
      };
    }

    return { isAdmin: false };
  }
}