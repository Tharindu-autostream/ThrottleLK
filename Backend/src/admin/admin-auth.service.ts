import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(dto: AdminLoginDto): Promise<{
    access_token: string;
    token_type: 'Bearer';
  }> {
    const username = dto.username.trim();
    const user = await this.usersService.findByUsername(username);
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwt.signAsync({
      sub: user.username,
      role: 'admin' as const,
    });

    return { access_token, token_type: 'Bearer' };
  }
}
