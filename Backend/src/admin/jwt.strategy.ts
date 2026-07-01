import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type AdminJwtPayload = {
  sub: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
    });
  }

  validate(payload: AdminJwtPayload): { username: string; role: string } {
    if (payload.role !== 'admin') {
      throw new UnauthorizedException();
    }
    return { username: payload.sub, role: payload.role };
  }
}
