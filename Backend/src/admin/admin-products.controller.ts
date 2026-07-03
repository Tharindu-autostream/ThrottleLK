import {
  BadRequestException,
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
import { ProductsService, ProductWithSlug } from '../products/products.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<ProductWithSlug[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductWithSlug> {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  @Post()
  create(@Body() dto: CreateProductDto): Promise<ProductWithSlug> {
    if (!dto.image?.trim() && !(dto.images?.length ?? 0)) {
      throw new BadRequestException('At least one product image is required');
    }
    return this.productsService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductWithSlug> {
    const product = await this.productsService.update(id, dto);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    const removed = await this.productsService.remove(id);
    if (!removed) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }
}
