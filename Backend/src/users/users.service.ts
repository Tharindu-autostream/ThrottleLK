import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.users.findOne({
      where: { username },
    });
  }

  countAdmins(): Promise<number> {
    return this.users.count({ where: { role: 'admin' } });
  }

  async createAdmin(data: {
    id: string;
    username: string;
    passwordHash: string;
  }): Promise<User> {
    const user = this.users.create({
      id: data.id,
      username: data.username,
      passwordHash: data.passwordHash,
      role: 'admin',
    });
    return this.users.save(user);
  }
}
