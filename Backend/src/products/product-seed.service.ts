import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CATALOG_SEED } from './catalog.seed';
import {
  DEFAULT_PRODUCT_DESCRIPTION,
  DEFAULT_PRODUCT_SPECIFICATIONS,
  DEFAULT_PRODUCT_SIZES,
  DEFAULT_PRODUCT_STOCK,
} from './product-defaults';
import { Product } from './product.entity';

@Injectable()
export class ProductSeedService implements OnModuleInit {
  private readonly logger = new Logger(ProductSeedService.name);

  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.products.count();
    if (count > 0) {
      return;
    }
    await this.products.save(
      CATALOG_SEED.map((row) =>
        this.products.create({
          ...row,
          description: row.description ?? DEFAULT_PRODUCT_DESCRIPTION,
          specifications:
            row.specifications && row.specifications.length > 0
              ? row.specifications
              : [...DEFAULT_PRODUCT_SPECIFICATIONS],
          sizes:
            row.sizes && row.sizes.length > 0
              ? row.sizes
              : [...DEFAULT_PRODUCT_SIZES],
          stock:
            typeof row.stock === 'number' && row.stock >= 0
              ? Math.floor(row.stock)
              : DEFAULT_PRODUCT_STOCK,
        }),
      ),
    );
    this.logger.log(`Seeded ${CATALOG_SEED.length} products`);
  }
}
