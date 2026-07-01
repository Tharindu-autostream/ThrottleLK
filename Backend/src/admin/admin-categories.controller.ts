import {
  Body,
  ConflictException,
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
import { Category } from '../categories/category.entity';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard)
export class AdminCategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  @Post()
  create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create({
      name: dto.name,
      sortOrder: dto.sortOrder ?? 0,
      parentId: dto.parentId ?? null,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    const before = await this.categoriesService.findOne(id);
    if (!before) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    const patch: Partial<Pick<Category, 'name' | 'sortOrder' | 'parentId'>> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    if (dto.parentId !== undefined) patch.parentId = dto.parentId;
    const updated = await this.categoriesService.update(id, patch);
    if (dto.name !== undefined && before.name !== updated.name) {
      await this.productsService.renameCategory(before.name, updated.name);
    }
    return updated;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    const subCount = await this.categoriesService.countChildren(id);
    if (subCount > 0) {
      throw new ConflictException(
        `Cannot delete "${category.name}" — ${subCount} sub-categor(y/ies) are still under it`,
      );
    }
    const inUse = await this.productsService.countByCategory(category.name);
    if (inUse > 0) {
      throw new ConflictException(
        `Cannot delete "${category.name}" — ${inUse} product(s) use this category`,
      );
    }
    await this.categoriesService.remove(id);
  }
}
