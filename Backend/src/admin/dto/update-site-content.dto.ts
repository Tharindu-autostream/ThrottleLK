import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MAX_GALLERY_IMAGES } from '../../site/site-content.defaults';

export class SiteGalleryImageDto {
  @IsString()
  @MaxLength(36)
  id: string;

  @IsString()
  @MaxLength(2048)
  url: string;

  @IsString()
  @MaxLength(128)
  title: string;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class UpdateSiteContentDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  heroImage?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  aboutFeaturedImage?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_GALLERY_IMAGES)
  @ValidateNested({ each: true })
  @Type(() => SiteGalleryImageDto)
  galleryImages?: SiteGalleryImageDto[];
}
