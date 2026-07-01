import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSiteContentDto } from '../admin/dto/update-site-content.dto';
import { SiteContent } from './site-content.entity';
import {
  DEFAULT_ABOUT_FEATURED_IMAGE,
  DEFAULT_GALLERY_IMAGES,
  DEFAULT_HERO_IMAGE,
  MAX_GALLERY_IMAGES,
  SITE_CONTENT_ID,
} from './site-content.defaults';
import type { SiteContentResponse, SiteGalleryImage } from './site-content.types';

@Injectable()
export class SiteContentService {
  constructor(
    @InjectRepository(SiteContent)
    private readonly repo: Repository<SiteContent>,
  ) {}

  async getPublicContent(): Promise<SiteContentResponse> {
    const row = await this.repo.findOne({ where: { id: SITE_CONTENT_ID } });
    return this.toResponse(row);
  }

  async update(dto: UpdateSiteContentDto): Promise<SiteContentResponse> {
    if (dto.galleryImages && dto.galleryImages.length > MAX_GALLERY_IMAGES) {
      throw new BadRequestException(
        `Gallery can have at most ${MAX_GALLERY_IMAGES} images`,
      );
    }

    let row = await this.repo.findOne({ where: { id: SITE_CONTENT_ID } });
    if (!row) {
      row = this.repo.create({ id: SITE_CONTENT_ID });
    }

    if (dto.heroImage !== undefined) {
      row.heroImage = dto.heroImage?.trim() || null;
    }
    if (dto.aboutFeaturedImage !== undefined) {
      row.aboutFeaturedImage = dto.aboutFeaturedImage?.trim() || null;
    }
    if (dto.galleryImages !== undefined) {
      row.galleryImages = this.normalizeGallery(dto.galleryImages);
    }

    await this.repo.save(row);
    return this.toResponse(row);
  }

  private normalizeGallery(
    items: SiteGalleryImage[],
  ): SiteGalleryImage[] {
    return [...items]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item, index) => ({
        id: item.id,
        url: item.url.trim(),
        title: item.title.trim() || `Image ${index + 1}`,
        sortOrder: index,
      }));
  }

  private toResponse(row: SiteContent | null): SiteContentResponse {
    const gallery =
      row?.galleryImages?.length
        ? [...row.galleryImages].sort((a, b) => a.sortOrder - b.sortOrder)
        : DEFAULT_GALLERY_IMAGES;

    return {
      heroImage: row?.heroImage?.trim() || DEFAULT_HERO_IMAGE,
      aboutFeaturedImage:
        row?.aboutFeaturedImage?.trim() || DEFAULT_ABOUT_FEATURED_IMAGE,
      galleryImages: gallery,
    };
  }
}
