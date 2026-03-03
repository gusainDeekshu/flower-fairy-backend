// src/auth/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  const user = request.user;

  console.log('--- BE ADMIN GUARD DEBUG ---');
  console.log('User object on Request:', user);

  if (!user || user.role !== 'ADMIN') {
    console.error(`Access Denied. User role is: ${user?.role}`);
    return false;
  }
  return true;
}
}