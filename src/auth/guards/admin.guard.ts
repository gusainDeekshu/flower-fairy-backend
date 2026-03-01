// src/auth/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    if (user?.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    
    return true;
  }
}