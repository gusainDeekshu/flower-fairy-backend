// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async isAdmin(email: string): Promise<boolean> {
    console.log('Checking admin status for email:', email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });
    console.log('User found:', user);
    return user?.role === 'ADMIN';
  }
}