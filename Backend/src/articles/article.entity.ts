import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ArticleStatus = 'draft' | 'published';

@Entity('articles')
export class Article {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  slug: string;

  @Column({ type: 'varchar', length: 500 })
  excerpt: string;

  /** Markdown body for long-form editorial content. */
  @Column({ type: 'mediumtext' })
  body: string;

  @Column({ name: 'cover_image', type: 'text', nullable: true })
  coverImage: string | null;

  @Column({ name: 'author_name', type: 'varchar', length: 120, default: 'Throttle LK' })
  authorName: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: ArticleStatus;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
