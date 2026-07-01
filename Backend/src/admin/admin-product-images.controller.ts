import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import {
  MAX_PRODUCT_IMAGES,
  ProductImagesService,
} from '../products/product-images.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from './jwt-auth.guard';

const SAFE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

@Controller('admin/products/images')
@UseGuards(JwtAuthGuard)
export class AdminProductImagesController {
  constructor(
    private readonly productImages: ProductImagesService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', MAX_PRODUCT_IMAGES, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ urls: string[] }> {
    if (!files?.length) {
      throw new BadRequestException('Select at least one image to upload');
    }
    if (files.length > MAX_PRODUCT_IMAGES) {
      throw new BadRequestException(
        `You can upload at most ${MAX_PRODUCT_IMAGES} images per request`,
      );
    }
    for (const file of files) {
      this.productImages.assertAllowedFile(file);
    }

    const urls = await Promise.all(
      files.map((file) => this.storeImage(file)),
    );
    return { urls };
  }

  /** Upload to Cloudinary CDN when configured, otherwise persist to local disk. */
  private async storeImage(file: Express.Multer.File): Promise<string> {
    if (this.cloudinary.isEnabled()) {
      const { url } = await this.cloudinary.uploadImage(
        file.buffer,
        file.originalname,
      );
      return url;
    }

    const ext = extname(file.originalname).toLowerCase();
    const safeExt = SAFE_EXTENSIONS.includes(ext) ? ext : '.jpg';
    const filename = `${randomUUID()}${safeExt}`;
    await writeFile(
      join(this.productImages.imagesDir, filename),
      file.buffer,
    );
    return this.productImages.publicUrl(filename);
  }
}
