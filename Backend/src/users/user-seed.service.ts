import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from './users.service';

/**
 * Ensures at least one admin row exists. Runs only when there are zero admin users.
 * Initial password comes from env (hash or plain), same precedence as legacy auth.
 */
@Injectable()
export class UserSeedService implements OnModuleInit {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminCount = await this.usersService.countAdmins();
    if (adminCount > 0) {
      return;
    }

    const username = (
      this.config.get<string>('ADMIN_USERNAME', 'admin') ?? 'admin'
    ).trim();
    const hashEnv = (this.config.get<string>('ADMIN_PASSWORD_HASH') ?? '').trim();
    const plainFromThrottle = (
      this.config.get<string>('THROTTLE_ADMIN_PASSWORD') ?? ''
    ).trim();
    const plainLegacy = (this.config.get<string>('ADMIN_PASSWORD') ?? '').trim();
    const plain =
      plainFromThrottle.length > 0 ? plainFromThrottle : plainLegacy;

    let passwordHash: string;
    if (hashEnv.length > 0) {
      passwordHash = hashEnv;
    } else if (plain.length > 0) {
      passwordHash = await bcrypt.hash(plain, 10);
    } else {
      passwordHash = await bcrypt.hash('admin', 10);
      this.logger.warn(
        'No ADMIN_PASSWORD_HASH or plain password in env; created admin with default password "admin". ' +
          'Set THROTTLE_ADMIN_PASSWORD or ADMIN_PASSWORD_HASH and rotate this account.',
      );
    }

    await this.usersService.createAdmin({
      id: randomUUID(),
      username,
      passwordHash,
    });
    this.logger.log(`Seeded admin user "${username}" in database`);
  }
}
