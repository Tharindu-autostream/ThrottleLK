import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { CategoriesModule } from '../categories/categories.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { SiteModule } from '../site/site.module';
import { UsersModule } from '../users/users.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminProductImagesController } from './admin-product-images.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminSiteContentController } from './admin-site-content.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '8h') as StringValue,
        },
      }),
    }),
    ProductsModule,
    CategoriesModule,
    SiteModule,
    UsersModule,
    OrdersModule,
  ],
  controllers: [
    AdminAuthController,
    AdminProductsController,
    AdminProductImagesController,
    AdminCategoriesController,
    AdminSiteContentController,
    AdminOrdersController,
  ],
  providers: [AdminAuthService, JwtStrategy],
})
export class AdminModule {}
