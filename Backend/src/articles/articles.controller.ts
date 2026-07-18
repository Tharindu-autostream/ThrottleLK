import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Article } from './article.entity';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findPublished(): Promise<Article[]> {
    return this.articlesService.findPublished();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<Article> {
    const article = await this.articlesService.findPublishedBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Article ${slug} not found`);
    }
    return article;
  }
}
