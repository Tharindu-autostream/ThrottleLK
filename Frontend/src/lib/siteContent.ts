export const MAX_GALLERY_IMAGES = 12;

export type SiteGalleryImage = {
  id: string;
  url: string;
  title: string;
  sortOrder: number;
};

export type SiteContent = {
  heroImage: string;
  aboutFeaturedImage: string;
  galleryImages: SiteGalleryImage[];
};

export const DEFAULT_HERO_IMAGE =
  'https://picsum.photos/1920/1080?grayscale&random=1';

export const DEFAULT_ABOUT_FEATURED_IMAGE =
  'https://images.unsplash.com/photo-1556755211-40b3588fe14e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGZhc2hpb24lMjBtb2RlbHxlbnwxfHx8fDE3Nzg3NTUyNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

export const DEFAULT_GALLERY_IMAGES: SiteGalleryImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1508216310976-c518daae0cdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMHN0cmVldHdlYXIlMjBob29kaWV8ZW58MXx8fHwxNzc4NzU1MjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Urban Edge',
    sortOrder: 0,
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1673092147872-5ddb03194341?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvb2RpZSUyMHN0cmVldHxlbnwxfHx8fDE3Nzg3NTUyNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Night Vibe',
    sortOrder: 1,
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1556755211-40b3588fe14e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGZhc2hpb24lMjBtb2RlbHxlbnwxfHx8fDE3Nzg3NTUyNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Raw Style',
    sortOrder: 2,
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1721637635502-b0abaaa75edb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyJTIwbGlmZXN0eWxlJTIwY2l0eXxlbnwxfHx8fDE3Nzg3NTUyNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'City Life',
    sortOrder: 3,
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1611063158871-7dd3ed4a2ac8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBncmFmZml0aSUyMHdhbGx8ZW58MXx8fHwxNzc4NzU1MjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Street Art',
    sortOrder: 4,
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1532332248682-206cc786359f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBzdHlsZSUyMGRhcmt8ZW58MXx8fHwxNzc4NzU1MjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Dark Mood',
    sortOrder: 5,
  },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroImage: DEFAULT_HERO_IMAGE,
  aboutFeaturedImage: DEFAULT_ABOUT_FEATURED_IMAGE,
  galleryImages: DEFAULT_GALLERY_IMAGES,
};

export function parseSiteContent(raw: unknown): SiteContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const heroImage =
    typeof data.heroImage === 'string' ? data.heroImage : null;
  const aboutFeaturedImage =
    typeof data.aboutFeaturedImage === 'string'
      ? data.aboutFeaturedImage
      : null;
  if (!heroImage || !aboutFeaturedImage) return null;

  const galleryRaw = data.galleryImages;
  if (!Array.isArray(galleryRaw)) return null;

  const galleryImages: SiteGalleryImage[] = [];
  for (const item of galleryRaw) {
    if (!item || typeof item !== 'object') continue;
    const g = item as Record<string, unknown>;
    if (typeof g.id !== 'string' || typeof g.url !== 'string') continue;
    galleryImages.push({
      id: g.id,
      url: g.url,
      title: typeof g.title === 'string' ? g.title : 'Gallery',
      sortOrder:
        typeof g.sortOrder === 'number' ? g.sortOrder : galleryImages.length,
    });
  }

  galleryImages.sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    heroImage,
    aboutFeaturedImage,
    galleryImages: galleryImages.length
      ? galleryImages
      : DEFAULT_GALLERY_IMAGES,
  };
}
