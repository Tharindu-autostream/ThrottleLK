import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getBackendPath } from '../config/env-paths';

export const MAX_PRODUCT_IMAGES = 5;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Injectable()
export class ProductImagesService {
  readonly imagesDir: string;

  constructor(private readonly config: ConfigService) {
    this.imagesDir = join(process.cwd(), 'images');
    if (!existsSync(this.imagesDir)) {
      mkdirSync(this.imagesDir, { recursive: true });
    }
  }

  assertAllowedFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported image type: ${file.mimetype}. Use JPEG, PNG, WebP, or GIF.`,
      );
    }
  }

  publicUrl(filename: string): string {
    const base = getBackendPath(this.config);
    return `${base}/images/${filename}`;
  }

  urlsFromFilenames(filenames: string[]): string[] {
    return filenames.map((f) => this.publicUrl(f));
  }
}
