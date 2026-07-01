import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import {
  getCorsOrigins,
  getListenPort,
  logPathConfig,
} from './config/env-paths';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const imagesDir = join(process.cwd(), 'images');
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
  }
  app.useStaticAssets(imagesDir, { prefix: '/images' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: getCorsOrigins(config),
    credentials: true,
  });

  logPathConfig(config);

  const port = getListenPort(config);
  await app.listen(port);
}
bootstrap();
