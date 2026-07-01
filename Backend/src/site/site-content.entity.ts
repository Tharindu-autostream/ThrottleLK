import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { SiteGalleryImage } from './site-content.types';

@Entity('site_content')
export class SiteContent {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'hero_image', type: 'text', nullable: true })
  heroImage: string | null;

  @Column({ name: 'about_featured_image', type: 'text', nullable: true })
  aboutFeaturedImage: string | null;

  @Column({ name: 'gallery_images', type: 'json', nullable: true })
  galleryImages: SiteGalleryImage[] | null;
}
