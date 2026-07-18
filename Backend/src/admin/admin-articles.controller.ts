import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Article } from '../articles/article.entity';
import { ArticlesService } from '../articles/articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('admin/articles')
@UseGuards(JwtAuthGuard)
export class AdminArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(): Promise<Article[]> {
    return this.articlesService.findAllAdmin();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Article> {
    const article = await this.articlesService.findOne(id);
    if (!article) {
      throw new NotFoundException(`Article ${id} not found`);
    }
    return article;
  }

  @Post()
  create(@Body() dto: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.articlesService.update(id, dto);
    if (!article) {
      throw new NotFoundException(`Article ${id} not found`);
    }
    return article;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    const removed = await this.articlesService.remove(id);
    if (!removed) {
      throw new NotFoundException(`Article ${id} not found`);
    }
  }
}
