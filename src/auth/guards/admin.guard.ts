import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('No bouquet for you! (Login required)');

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Check if the user has the ADMIN role defined in your Prisma ENUM
      if (payload.role !== 'ADMIN') {
        throw new UnauthorizedException('Staff only area!');
      }
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Session expired.');
    }
  }
}