import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { ARTICLE_SEED } from './article.seed';

@Injectable()
export class ArticleSeedService implements OnModuleInit {
  private readonly logger = new Logger(ArticleSeedService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.articles.count();
    if (count > 0) return;

    const now = new Date();
    await this.articles.save(
      ARTICLE_SEED.map((row, index) =>
        this.articles.create({
          id: randomUUID(),
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          body: row.body,
          coverImage: null,
          authorName: 'Throttle LK',
          status: 'published',
          publishedAt: new Date(now.getTime() - index * 86_400_000),
        }),
      ),
    );
    this.logger.log(`Seeded ${ARTICLE_SEED.length} published articles`);
  }
}
