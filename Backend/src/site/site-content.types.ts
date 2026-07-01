export interface SiteGalleryImage {
  id: string;
  url: string;
  title: string;
  sortOrder: number;
}

export interface SiteContentResponse {
  heroImage: string;
  aboutFeaturedImage: string;
  galleryImages: SiteGalleryImage[];
}
