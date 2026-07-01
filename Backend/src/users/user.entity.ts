import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  username: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  /** Application role; admin dashboard requires `admin`. */
  @Column({ type: 'varchar', length: 32, default: 'admin' })
  role: string;
}
