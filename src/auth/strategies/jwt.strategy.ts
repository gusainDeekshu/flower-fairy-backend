// flower-fairy-backend/src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
   // Safety check: If the secret is missing, the backend shouldn't even start
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // The 'as string' or '!' tells TypeScript we've confirmed it's not undefined
      secretOrKey: secret, 
    });
  }

  async validate(payload: any) {
    // This is called AFTER the strategy verifies the token signature
    if (!payload) {
      throw new UnauthorizedException();
    }
    
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}