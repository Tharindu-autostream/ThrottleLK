import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ProductsService, ProductWithSlug } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<ProductWithSlug[]> {
    return this.productsService.findAll();
  }

  /** Registered before `:id` so slugs (which contain hyphens, not just UUID chars) match here first. */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<ProductWithSlug> {
    const product = await this.productsService.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductWithSlug> {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }
}
