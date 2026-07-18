import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { slugify } from '../products/slug.util';
import { Article, ArticleStatus } from './article.entity';

export type ArticleUpsertFields = {
  title: string;
  slug?: string;
  excerpt: string;
  body: string;
  coverImage?: string | null;
  authorName?: string;
  status?: ArticleStatus;
  publishedAt?: string | Date | null;
};

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
  ) {}

  findAllAdmin(): Promise<Article[]> {
    return this.articles.find({ order: { updatedAt: 'DESC' } });
  }

  findPublished(): Promise<Article[]> {
    return this.articles.find({
      where: { status: 'published' },
      order: { publishedAt: 'DESC' },
    });
  }

  findPublishedBySlug(slug: string): Promise<Article | null> {
    return this.articles.findOne({
      where: { slug, status: 'published' },
    });
  }

  findOne(id: string): Promise<Article | null> {
    return this.articles.findOne({ where: { id } });
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || 'article';
    let candidate = root;
    let n = 2;
    while (true) {
      const existing = await this.articles.findOne({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${root}-${n}`;
      n += 1;
    }
  }

  private resolvePublishedAt(
    status: ArticleStatus,
    publishedAt: string | Date | null | undefined,
    previous?: Article | null,
  ): Date | null {
    if (status !== 'published') return null;
    if (publishedAt) return new Date(publishedAt);
    if (previous?.publishedAt) return previous.publishedAt;
    return new Date();
  }

  async create(data: ArticleUpsertFields): Promise<Article> {
    const status: ArticleStatus = data.status === 'published' ? 'published' : 'draft';
    const slug = await this.uniqueSlug(data.slug?.trim() || data.title);
    const article = this.articles.create({
      id: randomUUID(),
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt.trim(),
      body: data.body,
      coverImage: data.coverImage?.trim() || null,
      authorName: (data.authorName ?? 'Throttle LK').trim() || 'Throttle LK',
      status,
      publishedAt: this.resolvePublishedAt(status, data.publishedAt),
    });
    try {
      return await this.articles.save(article);
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      if (code === 'ER_DUP_ENTRY') {
        throw new ConflictException('An article with this slug already exists');
      }
      throw err;
    }
  }

  async update(id: string, data: Partial<ArticleUpsertFields>): Promise<Article | null> {
    const existing = await this.findOne(id);
    if (!existing) return null;

    if (data.title !== undefined) existing.title = data.title.trim();
    if (data.excerpt !== undefined) existing.excerpt = data.excerpt.trim();
    if (data.body !== undefined) existing.body = data.body;
    if (data.coverImage !== undefined) {
      existing.coverImage = data.coverImage?.trim() || null;
    }
    if (data.authorName !== undefined) {
      existing.authorName = data.authorName.trim() || 'Throttle LK';
    }
    if (data.status !== undefined) {
      existing.status = data.status === 'published' ? 'published' : 'draft';
    }
    if (data.slug !== undefined || data.title !== undefined) {
      const slugSource = data.slug?.trim() || data.title?.trim() || existing.title;
      existing.slug = await this.uniqueSlug(slugSource, existing.id);
    }
    existing.publishedAt = this.resolvePublishedAt(
      existing.status,
      data.publishedAt,
      existing,
    );

    try {
      return await this.articles.save(existing);
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      if (code === 'ER_DUP_ENTRY') {
        throw new ConflictException('An article with this slug already exists');
      }
      throw err;
    }
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.articles.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
