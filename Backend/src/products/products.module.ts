import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductImagesService } from './product-images.service';
import { ProductSeedService } from './product-seed.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductSeedService, ProductImagesService],
  exports: [ProductsService, ProductImagesService],
})
export class ProductsModule {}
